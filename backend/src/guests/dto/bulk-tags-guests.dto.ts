import { ArrayMinSize, IsArray, IsUUID } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class BulkTagsGuestsDto {
	@ApiProperty({ type: [String] })
	@IsArray()
	@ArrayMinSize(1)
	@IsUUID('4', { each: true })
	ids: string[]

	@ApiProperty({ type: [String], description: 'Tag IDs to set on all selected guests' })
	@IsArray()
	@IsUUID('4', { each: true })
	tagIds: string[]
}
