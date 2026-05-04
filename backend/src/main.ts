import { NestFactory } from '@nestjs/core'
import { type LogLevel, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/logging/all-exceptions.filter'
import { HttpLoggingInterceptor } from './common/logging/http-logging.interceptor'
import { requestIdMiddleware } from './common/logging/request-id.middleware'

function resolveLogLevels(rawValue: string | undefined): LogLevel[] {
	const validLevels: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose', 'fatal']
	const selectedLevels =
		rawValue
			?.split(',')
			.map((level) => level.trim().toLowerCase())
			.filter((level): level is LogLevel => validLevels.includes(level as LogLevel)) ?? []

	return selectedLevels.length > 0 ? selectedLevels : ['log', 'warn', 'error', 'debug']
}

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: resolveLogLevels(process.env.LOG_LEVEL),
	})

	app.setGlobalPrefix('api')

	app.use(helmet())

	app.enableCors({
		origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'],
		credentials: true,
	})

	app.use(requestIdMiddleware)

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: { enableImplicitConversion: true },
		})
	)

	const configService = app.get(ConfigService)
	app.useGlobalInterceptors(new HttpLoggingInterceptor(configService))
	app.useGlobalFilters(new AllExceptionsFilter(configService))

	const swaggerConfig = new DocumentBuilder()
		.setTitle('Event CRM API')
		.setDescription('API for managing wedding & bride farewell events')
		.setVersion('1.0')
		.addBearerAuth()
		.build()

	const document = SwaggerModule.createDocument(app, swaggerConfig)
	SwaggerModule.setup('api/docs', app, document)

	const port = process.env.PORT ?? 3000
	await app.listen(port)
}
bootstrap()
