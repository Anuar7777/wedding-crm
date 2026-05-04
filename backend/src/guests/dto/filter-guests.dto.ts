import { IsOptional, IsEnum, IsArray, IsUUID } from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { EventType, GuestStatus } from '@prisma/client'
import { PaginationDto } from '../../common/dto/pagination.dto'

export class FilterGuestsDto extends PaginationDto {
	@ApiPropertyOptional({ enum: EventType })
	@IsOptional()
	@IsEnum(EventType)
	type?: EventType

	@ApiPropertyOptional({ enum: GuestStatus })
	@IsOptional()
	@IsEnum(GuestStatus)
	status?: GuestStatus

	@ApiPropertyOptional({
		type: [String],
		description: 'Filter by tag IDs (comma-separated in query)',
	})
	@IsOptional()
	@IsArray()
	@IsUUID('4', { each: true })
	@Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value))
	tagIds?: string[]

	@ApiPropertyOptional({ description: 'Search by guest name' })
	@IsOptional()
	search?: string
}
