import { EventType, UserRole } from '@prisma/client'

export interface AuthenticatedUser {
	id: string
	email: string
	role: UserRole
	scope: EventType | null
	telegramChatId: string | null
}
