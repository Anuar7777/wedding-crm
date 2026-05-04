import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Request, Response } from 'express'
import {
	extractUserId,
	resolveRequestId,
	sanitizeBody,
	sanitizeHeaders,
	type RequestWithContext,
} from './request-context.util'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(AllExceptionsFilter.name)
	private readonly logBodyEnabled: boolean
	private readonly logStackEnabled: boolean

	constructor(private readonly configService: ConfigService) {
		this.logBodyEnabled = this.configService.get('LOG_BODY') === 'true'
		this.logStackEnabled = this.configService.get('LOG_STACK') !== 'false'
	}

	catch(exception: unknown, host: ArgumentsHost): void {
		if (host.getType() !== 'http') {
			throw exception
		}

		const ctx = host.switchToHttp()
		const request = ctx.getRequest<RequestWithContext>()
		const response = ctx.getResponse<Response>()
		const requestId = resolveRequestId(request)
		const statusCode =
			exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
		const error = exception instanceof Error ? exception : undefined
		const stack = this.logStackEnabled || statusCode >= 500 ? error?.stack : undefined

		const payload: Record<string, unknown> = {
			event: 'request.failed',
			requestId,
			method: request.method,
			path: request.originalUrl,
			statusCode,
			userId: extractUserId(request),
			errorName: error?.name ?? 'UnknownError',
			message: this.resolveErrorMessage(exception),
		}

		if (this.logBodyEnabled) {
			payload.headers = sanitizeHeaders(request.headers)
			payload.query = sanitizeBody(request.query)
			payload.body = sanitizeBody(request.body)
		}

		const serializedPayload = JSON.stringify(payload)
		if (statusCode >= 500) {
			this.logger.error(serializedPayload, stack)
		} else {
			this.logger.warn(serializedPayload, stack)
		}

		response.status(statusCode).json({
			statusCode,
			message: this.resolveClientMessage(exception),
			requestId,
			timestamp: new Date().toISOString(),
			path: request.originalUrl,
		})
	}

	private resolveErrorMessage(exception: unknown): string {
		if (exception instanceof HttpException) {
			const response = exception.getResponse()
			if (typeof response === 'string') {
				return response
			}
			if (
				response &&
				typeof response === 'object' &&
				'message' in response &&
				typeof response.message === 'string'
			) {
				return response.message
			}
			return exception.message
		}
		if (exception instanceof Error) {
			return exception.message
		}
		return 'Unhandled error'
	}

	private resolveClientMessage(exception: unknown): string | string[] {
		if (exception instanceof HttpException) {
			const response = exception.getResponse()
			if (
				response &&
				typeof response === 'object' &&
				'message' in response &&
				(Array.isArray(response.message) || typeof response.message === 'string')
			) {
				return response.message
			}
			return exception.message
		}
		return 'Internal server error'
	}
}
