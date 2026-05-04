import { IsString, IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { EventType } from '@prisma/client'

export class CreateTagDto {
	@ApiProperty({ example: 'Друзья жениха' })
	@IsString()
	name: string

	@ApiProperty({ enum: EventType })
	@IsEnum(EventType)
	type: EventType
}
