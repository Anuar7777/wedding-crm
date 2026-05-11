import { ApiProperty } from '@nestjs/swagger'

export class AccessTokenResponseDto {
	@ApiProperty({ description: 'Short-lived JWT; send as Authorization: Bearer' })
	accessToken: string
}
