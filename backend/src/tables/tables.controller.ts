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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { EventType } from '@prisma/client'
import { TablesService } from './tables.service'
import { CreateTableDto } from './dto/create-table.dto'
import { UpdateTableDto } from './dto/update-table.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Tables')
@ApiBearerAuth()
@Controller('tables')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TablesController {
	constructor(private tablesService: TablesService) {}

	@Post()
	@ApiOperation({ summary: 'Create a new table' })
	create(@Body() dto: CreateTableDto, @CurrentUser('scope') scope: EventType | null) {
		return this.tablesService.create(dto, scope)
	}

	@Get()
	@ApiOperation({ summary: 'List tables with occupancy info' })
	@ApiQuery({ name: 'type', enum: EventType, required: false })
	findAll(@CurrentUser('scope') scope: EventType | null, @Query('type') type?: EventType) {
		return this.tablesService.findAll(scope, type)
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a single table with guests' })
	findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('scope') scope: EventType | null) {
		return this.tablesService.findOne(id, scope)
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a table' })
	update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdateTableDto,
		@CurrentUser('scope') scope: EventType | null
	) {
		return this.tablesService.update(id, dto, scope)
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a table' })
	remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('scope') scope: EventType | null) {
		return this.tablesService.remove(id, scope)
	}

	@Post(':tableId/assign/:guestId')
	@ApiOperation({ summary: 'Assign a guest to a table (checks capacity)' })
	assignGuest(
		@Param('tableId', ParseUUIDPipe) tableId: string,
		@Param('guestId', ParseUUIDPipe) guestId: string,
		@CurrentUser('scope') scope: EventType | null
	) {
		return this.tablesService.assignGuest(tableId, guestId, scope)
	}

	@Delete(':tableId/assign/:guestId')
	@ApiOperation({ summary: 'Remove a guest from a table' })
	unassignGuest(
		@Param('tableId', ParseUUIDPipe) tableId: string,
		@Param('guestId', ParseUUIDPipe) guestId: string,
		@CurrentUser('scope') scope: EventType | null
	) {
		return this.tablesService.unassignGuest(tableId, guestId, scope)
	}
}
