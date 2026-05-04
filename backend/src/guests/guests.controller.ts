import {
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Param,
	Body,
	Query,
	UseGuards,
	ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { GuestsService } from './guests.service'
import { CreateGuestDto } from './dto/create-guest.dto'
import { UpdateGuestDto } from './dto/update-guest.dto'
import { FilterGuestsDto } from './dto/filter-guests.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Guests')
@Controller('guests')
export class GuestsController {
	constructor(private guestsService: GuestsService) {}

	@Post()
	@ApiOperation({ summary: 'Create a new guest' })
	create(@Body() dto: CreateGuestDto, @CurrentUser('scope') scope: string | null) {
		return this.guestsService.create(dto, scope as any)
	}

	@Get()
	@ApiOperation({ summary: 'List guests with filters and pagination' })
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, RolesGuard)
	findAll(@Query() filters: FilterGuestsDto, @CurrentUser('scope') scope: string | null) {
		return this.guestsService.findAll(filters, scope as any)
	}

	@Get('stats')
	@ApiOperation({ summary: 'Get guest statistics' })
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, RolesGuard)
	getStats(@CurrentUser('scope') scope: string | null) {
		return this.guestsService.getStats(scope as any)
	}

	@Get('duplicates')
	@ApiOperation({ summary: 'List flagged duplicate guests' })
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, RolesGuard)
	getDuplicates(@CurrentUser('scope') scope: string | null) {
		return this.guestsService.getDuplicates(scope as any)
	}

	@Post('detect-duplicates')
	@ApiOperation({ summary: 'Detect duplicates for all guests' })
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, RolesGuard)
	detectDuplicates(@CurrentUser('scope') scope: string | null) {
		return this.guestsService.detectDuplicatesForAll(scope as any)
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a single guest' })
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, RolesGuard)
	findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('scope') scope: string | null) {
		return this.guestsService.findOne(id, scope as any)
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a guest' })
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, RolesGuard)
	update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdateGuestDto,
		@CurrentUser('scope') scope: string | null
	) {
		return this.guestsService.update(id, dto, scope as any)
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a guest' })
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, RolesGuard)
	remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('scope') scope: string | null) {
		return this.guestsService.remove(id, scope as any)
	}
}
