import { IsInt, IsOptional, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateTableDto {
	@ApiPropertyOptional({ example: 2 })
	@IsOptional()
	@IsInt()
	@Min(1)
	number?: number

	@ApiPropertyOptional({ example: 10 })
	@IsOptional()
	@IsInt()
	@Min(1)
	capacity?: number
}
