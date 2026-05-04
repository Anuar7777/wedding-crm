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
import { TagsService } from './tags.service'
import { CreateTagDto } from './dto/create-tag.dto'
import { UpdateTagDto } from './dto/update-tag.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Tags')
@ApiBearerAuth()
@Controller('tags')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TagsController {
	constructor(private tagsService: TagsService) {}

	@Post()
	@ApiOperation({ summary: 'Create a new tag' })
	create(@Body() dto: CreateTagDto, @CurrentUser('scope') scope: string | null) {
		return this.tagsService.create(dto, scope as any)
	}

	@Get()
	@ApiOperation({ summary: 'List tags (filtered by event type)' })
	@ApiQuery({ name: 'type', enum: EventType, required: false })
	findAll(@CurrentUser('scope') scope: string | null, @Query('type') type?: EventType) {
		return this.tagsService.findAll(scope as any, type)
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a single tag' })
	findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('scope') scope: string | null) {
		return this.tagsService.findOne(id, scope as any)
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Rename a tag' })
	update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdateTagDto,
		@CurrentUser('scope') scope: string | null
	) {
		return this.tagsService.update(id, dto, scope as any)
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a tag' })
	remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('scope') scope: string | null) {
		return this.tagsService.remove(id, scope as any)
	}
}
