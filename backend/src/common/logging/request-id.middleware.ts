import type { NextFunction, Request, Response } from 'express'
import { resolveRequestId, type RequestWithContext } from './request-context.util'

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
	const requestId = resolveRequestId(req as RequestWithContext)
	res.setHeader('x-request-id', requestId)
	next()
}
