import { IsInt, IsEnum, IsOptional, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { EventType } from '@prisma/client'

export class CreateTableDto {
	@ApiProperty({ example: 1 })
	@IsInt()
	@Min(1)
	number: number

	@ApiPropertyOptional({ example: 12, default: 12 })
	@IsOptional()
	@IsInt()
	@Min(1)
	capacity?: number

	@ApiProperty({ enum: EventType })
	@IsEnum(EventType)
	type: EventType
}
