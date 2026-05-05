import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { AuthenticatedUser } from '../types/authenticated-user.interface'

interface RefreshAuthenticatedUser {
	sub: string
	email: string
	refreshToken: string
}

type CurrentRequestUser = AuthenticatedUser | RefreshAuthenticatedUser
type CurrentUserField = keyof AuthenticatedUser | keyof RefreshAuthenticatedUser

export const CurrentUser = createParamDecorator(
	(data: CurrentUserField | undefined, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest<{ user?: CurrentRequestUser }>()
		const user = request.user
		if (!data) {
			return user
		}
		if (!user) {
			return undefined
		}
		return (user as Record<CurrentUserField, unknown>)[data]
	}
)
