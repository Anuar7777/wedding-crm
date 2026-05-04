import { IsString, IsEnum, IsOptional, IsArray, IsUUID } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { GuestStatus } from '@prisma/client'

export class UpdateGuestDto {
	@ApiPropertyOptional({ example: 'Иван Иванов' })
	@IsOptional()
	@IsString()
	fullName?: string

	@ApiPropertyOptional({ enum: GuestStatus })
	@IsOptional()
	@IsEnum(GuestStatus)
	status?: GuestStatus

	@ApiPropertyOptional({ example: 'Анна Иванова' })
	@IsOptional()
	@IsString()
	partnerFullName?: string

	@ApiPropertyOptional({ type: [String], description: 'Array of tag IDs to replace current tags' })
	@IsOptional()
	@IsArray()
	@IsUUID('4', { each: true })
	tagIds?: string[]

	@ApiPropertyOptional({ description: 'Manually override duplicate flag' })
	@IsOptional()
	isDuplicate?: boolean
}
