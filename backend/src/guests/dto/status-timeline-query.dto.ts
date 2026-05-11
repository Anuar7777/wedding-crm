import { IsOptional, IsEnum, IsDateString } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { EventType } from '@prisma/client'

export class StatusTimelineQueryDto {
	@ApiPropertyOptional({ enum: EventType })
	@IsOptional()
	@IsEnum(EventType)
	type?: EventType

	@ApiPropertyOptional({ description: 'ISO date (inclusive)' })
	@IsOptional()
	@IsDateString()
	from?: string

	@ApiPropertyOptional({ description: 'ISO date (inclusive)' })
	@IsOptional()
	@IsDateString()
	to?: string
}
