import type { Request } from 'express'
import { randomUUID } from 'node:crypto'

export type RequestWithContext = Request & {
	requestId?: string
	user?: { sub?: string; id?: string }
}

const SENSITIVE_HEADER_NAMES = new Set(['authorization', 'cookie', 'set-cookie'])
const SENSITIVE_BODY_KEYS = new Set(['password', 'token', 'accessToken', 'refreshToken'])

export function resolveRequestId(req: RequestWithContext): string {
	if (req.requestId) {
		return req.requestId
	}

	const incomingRequestId = req.header('x-request-id')
	const requestId = incomingRequestId?.trim() || randomUUID()
	req.requestId = requestId
	return requestId
}

export function extractUserId(req: RequestWithContext): string | undefined {
	return req.user?.sub ?? req.user?.id
}

export function sanitizeHeaders(headers: Request['headers']): Record<string, string> {
	const output: Record<string, string> = {}
	for (const [headerName, headerValue] of Object.entries(headers)) {
		if (SENSITIVE_HEADER_NAMES.has(headerName.toLowerCase())) {
			output[headerName] = '[REDACTED]'
			continue
		}
		output[headerName] = Array.isArray(headerValue) ? headerValue.join(',') : String(headerValue)
	}
	return output
}

export function sanitizeBody(payload: unknown): unknown {
	if (!payload || typeof payload !== 'object') {
		return payload
	}

	if (Array.isArray(payload)) {
		return payload.map((item) => sanitizeBody(item))
	}

	const sanitized: Record<string, unknown> = {}
	for (const [key, value] of Object.entries(payload)) {
		if (SENSITIVE_BODY_KEYS.has(key)) {
			sanitized[key] = '[REDACTED]'
			continue
		}
		sanitized[key] = sanitizeBody(value)
	}
	return sanitized
}
