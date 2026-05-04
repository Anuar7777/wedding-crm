import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { UserRole, EventType } from '@prisma/client'

export class CreateUserDto {
	@ApiProperty({ example: 'admin@example.com' })
	@IsEmail()
	email: string

	@ApiProperty({ example: 'strongPassword123' })
	@IsString()
	@MinLength(6)
	password: string

	@ApiPropertyOptional({ enum: UserRole, default: UserRole.ADMIN })
	@IsOptional()
	@IsEnum(UserRole)
	role?: UserRole

	@ApiPropertyOptional({ enum: EventType })
	@IsOptional()
	@IsEnum(EventType)
	scope?: EventType
}
