import { IsString, IsEnum, IsOptional, IsArray, IsUUID } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { EventType, GuestStatus } from '@prisma/client'

export class CreateGuestDto {
	@ApiProperty({ example: 'Иван Иванов' })
	@IsString()
	fullName: string

	@ApiProperty({ enum: EventType })
	@IsEnum(EventType)
	type: EventType

	@ApiPropertyOptional({ enum: GuestStatus })
	@IsOptional()
	@IsEnum(GuestStatus)
	status?: GuestStatus

	@ApiPropertyOptional({ example: 'Анна Иванова' })
	@IsOptional()
	@IsString()
	partnerFullName?: string

	@ApiPropertyOptional({ type: [String], description: 'Array of tag IDs' })
	@IsOptional()
	@IsArray()
	@IsUUID('4', { each: true })
	tagIds?: string[]
}
