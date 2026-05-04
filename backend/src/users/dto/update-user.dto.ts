import { IsEnum, IsOptional, IsString } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { UserRole, EventType } from '@prisma/client'

export class UpdateUserDto {
	@ApiPropertyOptional({ enum: UserRole })
	@IsOptional()
	@IsEnum(UserRole)
	role?: UserRole

	@ApiPropertyOptional({ enum: EventType })
	@IsOptional()
	@IsEnum(EventType)
	scope?: EventType

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	telegramChatId?: string
}
