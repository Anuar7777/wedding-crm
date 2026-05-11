import { IsOptional, IsEnum, IsArray, IsUUID, IsBoolean } from 'class-validator'
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

	@ApiPropertyOptional({
		description: 'Filter by assigned table (ignored when unassigned is true)',
	})
	@IsOptional()
	@IsUUID('4')
	tableId?: string

	@ApiPropertyOptional({ description: 'Only guests with no table (query: unassigned=true)' })
	@IsOptional()
	@Transform(({ value }): boolean | undefined => {
		if (value === true || value === 'true' || value === '1' || value === 1) return true
		if (value === false || value === 'false' || value === '0' || value === 0) return false
		return undefined
	})
	@IsBoolean()
	unassigned?: boolean

	@ApiPropertyOptional({ description: 'Search by guest name' })
	@IsOptional()
	search?: string
}
