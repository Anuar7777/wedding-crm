import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common'
import { Response } from 'express'

interface ErrorResponseShape {
	message?: string | object
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(AllExceptionsFilter.name)

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()

		let status = HttpStatus.INTERNAL_SERVER_ERROR
		let message: string | object = 'Internal server error'

		if (exception instanceof HttpException) {
			status = exception.getStatus()
			const res = exception.getResponse()
			if (typeof res === 'string') {
				message = res
			} else if (this.hasMessage(res)) {
				message = res.message ?? res
			} else {
				message = res
			}
		} else if (exception instanceof Error) {
			this.logger.error(exception.message, exception.stack)
		}

		response.status(status).json({
			statusCode: status,
			message,
			timestamp: new Date().toISOString(),
		})
	}

	private hasMessage(value: unknown): value is ErrorResponseShape {
		return typeof value === 'object' && value !== null && 'message' in value
	}
}
