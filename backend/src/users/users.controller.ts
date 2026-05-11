import {
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Param,
	Body,
	UseGuards,
	ParseUUIDPipe,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UserRole } from '@prisma/client'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN)
export class UsersController {
	constructor(
		private usersService: UsersService,
		private config: ConfigService
	) {}

	@Get('reset-password-default')
	@ApiOperation({
		summary: 'Suggested password for reset dialog (from DEFAULT_RESET_PASSWORD env)',
	})
	getResetPasswordDefault() {
		const raw = this.config.get<string>('DEFAULT_RESET_PASSWORD')?.trim() ?? ''
		return { defaultPassword: raw.length > 0 ? raw : null }
	}

	@Post()
	@ApiOperation({ summary: 'Create a new admin user (SuperAdmin only)' })
	create(@Body() dto: CreateUserDto) {
		return this.usersService.create(dto)
	}

	@Get()
	@ApiOperation({ summary: 'List all users (SuperAdmin only)' })
	findAll() {
		return this.usersService.findAll()
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a single user (SuperAdmin only)' })
	findOne(@Param('id', ParseUUIDPipe) id: string) {
		return this.usersService.findOne(id)
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a user (SuperAdmin only)' })
	update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
		return this.usersService.update(id, dto)
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a user (SuperAdmin only)' })
	remove(@Param('id', ParseUUIDPipe) id: string) {
		return this.usersService.remove(id)
	}

	@Post(':id/reset-password')
	@ApiOperation({ summary: 'Reset user password (SuperAdmin only)' })
	resetPassword(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ResetPasswordDto) {
		return this.usersService.resetPassword(id, dto.newPassword)
	}
}
