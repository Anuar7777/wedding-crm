import { ArrayMinSize, IsArray, IsUUID } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class BulkDeleteGuestsDto {
	@ApiProperty({ type: [String] })
	@IsArray()
	@ArrayMinSize(1)
	@IsUUID('4', { each: true })
	ids: string[]
}
