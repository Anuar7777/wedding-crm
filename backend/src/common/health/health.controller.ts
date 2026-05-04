import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

@Controller()
@ApiTags('system')
export class HealthController {
	@Get('health')
	@ApiOperation({ summary: 'Health check endpoint' })
	@ApiOkResponse({ description: 'Service is healthy' })
	health(): { status: string } {
		return { status: 'ok' }
	}
}
