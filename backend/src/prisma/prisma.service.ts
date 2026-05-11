import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	constructor() {
		const max = Number(process.env.PG_POOL_MAX ?? 20)
		const pool = new Pool({
			connectionString: process.env.DATABASE_URL,
			max: Number.isFinite(max) && max > 0 ? max : 20,
			idleTimeoutMillis: 30_000,
		})
		const adapter = new PrismaPg(pool)
		super({ adapter })
	}

	async onModuleInit() {
		await this.$connect()
	}

	async onModuleDestroy() {
		await this.$disconnect()
	}
}
