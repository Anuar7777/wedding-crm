import { IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateTagDto {
	@ApiProperty({ example: 'Коллеги мамы' })
	@IsString()
	name: string
}
