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
import { Throttle, ThrottlerGuard } from '@nestjs/throttler'
import { EventType } from '@prisma/client'
import { GuestsService } from './guests.service'
import { CreateGuestDto } from './dto/create-guest.dto'
import { UpdateGuestDto } from './dto/update-guest.dto'
import { FilterGuestsDto } from './dto/filter-guests.dto'
import { StatsQueryDto } from './dto/stats-query.dto'
import { StatusTimelineQueryDto } from './dto/status-timeline-query.dto'
import { BulkDeleteGuestsDto } from './dto/bulk-delete-guests.dto'
import { BulkTagsGuestsDto } from './dto/bulk-tags-guests.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Guests')
@Controller('guests')
export class GuestsController {
	constructor(private guestsService: GuestsService) {}

	@Post()
	@UseGuards(ThrottlerGuard)
	@Throttle({
		short: { limit: 15, ttl: 60_000 },
		long: { limit: 60, ttl: 600_000 },
	})
	@ApiOperation({ summary: 'Create a new guest' })
	create(@Body() dto: CreateGuestDto, @CurrentUser('scope') scope: EventType | null) {
		return this.guestsService.create(dto, scope)
	}

	@Get()
	@ApiOperation({ summary: 'List guests with filters and pagination' })
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, RolesGuard)
	findAll(@Query() filters: FilterGuestsDto, @CurrentUser('scope') scope: EventType | null) {
		return this.guestsService.findAll(filters, scope)
	}

	@Get('stats')
	@ApiOperation({
		summary: 'Get guest statistics',
		description:
			'total = list rows (all statuses). totalAttendees = expected headcount among confirmations (ATTENDING + 2× ATTENDING_WITH_SPOUSE). unassigned = rows without a table. unassignedConfirmedSeats = seats still to place for confirmed guests without a table.',
	})
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, RolesGuard)
	getStats(@Query() statsQuery: StatsQueryDto, @CurrentUser('scope') scope: EventType | null) {
		return this.guestsService.getStats(scope, statsQuery.type)
	}

	@Get('status-timeline')
	@ApiOperation({ summary: 'Daily confirmation events for charts' })
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, RolesGuard)
	getStatusTimeline(
		@Query() query: StatusTimelineQueryDto,
		@CurrentUser('scope') scope: EventType | null
	) {
		return this.guestsService.getStatusTimeline(scope, query)
	}

	@Post('bulk-delete')
	@ApiOperation({ summary: 'Delete multiple guests' })
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, RolesGuard)
	bulkDelete(@Body() dto: BulkDeleteGuestsDto, @CurrentUser('scope') scope: EventType | null) {
		return this.guestsService.bulkDelete(dto, scope)
	}

	@Patch('bulk-tags')
	@ApiOperation({ summary: 'Replace tags for multiple guests' })
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, RolesGuard)
	bulkSetTags(@Body() dto: BulkTagsGuestsDto, @CurrentUser('scope') scope: EventType | null) {
		return this.guestsService.bulkSetTags(dto, scope)
	}

	@Get('duplicates')
	@ApiOperation({ summary: 'List flagged duplicate guests' })
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, RolesGuard)
	getDuplicates(@CurrentUser('scope') scope: EventType | null) {
		return this.guestsService.getDuplicates(scope)
	}

	@Post('detect-duplicates')
	@ApiOperation({ summary: 'Detect duplicates for all guests' })
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, RolesGuard)
	detectDuplicates(@CurrentUser('scope') scope: EventType | null) {
		return this.guestsService.detectDuplicatesForAll(scope)
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a single guest' })
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, RolesGuard)
	findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('scope') scope: EventType | null) {
		return this.guestsService.findOne(id, scope)
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a guest' })
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, RolesGuard)
	update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdateGuestDto,
		@CurrentUser('scope') scope: EventType | null
	) {
		return this.guestsService.update(id, dto, scope)
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a guest' })
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, RolesGuard)
	remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('scope') scope: EventType | null) {
		return this.guestsService.remove(id, scope)
	}
}
