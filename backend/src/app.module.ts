import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { envValidationSchema } from './config/env.validation'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { GuestsModule } from './guests/guests.module'
import { TagsModule } from './tags/tags.module'
import { TablesModule } from './tables/tables.module'
import { TelegramModule } from './telegram/telegram.module'
import { HealthController } from './common/health/health.controller'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validationSchema: envValidationSchema,
		}),
		ThrottlerModule.forRoot([
			{
				name: 'short',
				ttl: 60000,
				limit: 10,
			},
			{
				name: 'long',
				ttl: 600000,
				limit: 100,
			},
		]),
		PrismaModule,
		AuthModule,
		UsersModule,
		GuestsModule,
		TagsModule,
		TablesModule,
		TelegramModule,
	],
	controllers: [HealthController],
})
export class AppModule {}
