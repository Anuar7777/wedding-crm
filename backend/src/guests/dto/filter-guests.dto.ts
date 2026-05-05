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
	@Transform(({ value }): string[] | undefined => {
		if (typeof value === 'string') {
			return value.split(',')
		}
		if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
			return value
		}
		return undefined
	})
	tagIds?: string[]

	@ApiPropertyOptional({ description: 'Search by guest name' })
	@IsOptional()
	search?: string
}
