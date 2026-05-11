export type EventType = 'BRIDE_FAREWELL' | 'WEDDING'

export type UserRole = 'SUPERADMIN' | 'ADMIN'

export type GuestStatus = 'PENDING' | 'ATTENDING' | 'ATTENDING_WITH_SPOUSE' | 'DECLINED'

export type MeResponse = {
	id: string
	email: string
	role: UserRole
	scope: EventType | null
}

export type TagEntity = {
	id: string
	name: string
	type: EventType
	_count?: { guests: number }
}

export type TableEntity = {
	id: string
	number: number
	capacity: number
	type: EventType
	guests: { id: string; fullName: string; status: GuestStatus }[]
	occupiedSeats: number
	availableSeats: number
}

export type GuestEntity = {
	id: string
	fullName: string
	status: GuestStatus
	partnerFullName: string | null
	type: EventType
	tableId: string | null
	table: { id: string; number: number } | null
	tags: TagEntity[]
	isDuplicate: boolean
	createdAt: string
	updatedAt: string
}

export type PaginatedGuests = {
	data: GuestEntity[]
	meta: { total: number; page: number; limit: number; totalPages: number }
}

export type GuestStats = {
	total: number
	pending: number
	attending: number
	attendingWithSpouse: number
	declined: number
	totalAttendees: number
	duplicates: number
}

export type StatusTimelineResponse = {
	type: EventType
	from: string
	to: string
	series: { date: string; confirmations: number }[]
}

export type UserEntity = {
	id: string
	email: string
	role: UserRole
	scope: EventType | null
	telegramChatId: string | null
	createdAt: string
	updatedAt: string
}
