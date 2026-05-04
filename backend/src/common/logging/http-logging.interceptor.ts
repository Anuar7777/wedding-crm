import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Request, Response } from 'express'
import { Observable, tap } from 'rxjs'
import {
	extractUserId,
	resolveRequestId,
	sanitizeBody,
	sanitizeHeaders,
	type RequestWithContext,
} from './request-context.util'

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
	private readonly logger = new Logger(HttpLoggingInterceptor.name)
	private readonly logBodyEnabled: boolean
	private readonly log4xxEnabled: boolean

	constructor(configService: ConfigService) {
		this.logBodyEnabled = configService.get('LOG_BODY') === 'true'
		this.log4xxEnabled = configService.get('LOG_4XX') !== 'false'
	}

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		if (context.getType() !== 'http') {
			return next.handle()
		}

		const request = context.switchToHttp().getRequest<RequestWithContext>()
		const response = context.switchToHttp().getResponse<Response>()
		const startedAt = Date.now()
		const requestId = resolveRequestId(request)

		return next.handle().pipe(
			tap({
				next: () => {
					this.logRequest(request, response, requestId, Date.now() - startedAt)
				},
				error: () => {
					// Error details are logged by global exception filter.
				},
			})
		)
	}

	private logRequest(
		request: Request,
		response: Response,
		requestId: string,
		durationMs: number
	): void {
		const statusCode = response.statusCode
		if (statusCode >= 400 && !this.log4xxEnabled) {
			return
		}

		const payload: Record<string, unknown> = {
			event: 'request.completed',
			requestId,
			method: request.method,
			path: request.originalUrl,
			statusCode,
			durationMs,
			userId: extractUserId(request as RequestWithContext),
		}

		if (this.logBodyEnabled) {
			payload.headers = sanitizeHeaders(request.headers)
			payload.query = sanitizeBody(request.query)
			payload.body = sanitizeBody(request.body)
		}

		const serializedPayload = JSON.stringify(payload)
		if (statusCode >= 500) {
			this.logger.error(serializedPayload)
			return
		}
		if (statusCode >= 400) {
			this.logger.warn(serializedPayload)
			return
		}
		this.logger.log(serializedPayload)
	}
}
