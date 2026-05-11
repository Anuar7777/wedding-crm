import { PrismaClient, UserRole } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as argon2 from 'argon2'

const MIN_PASSWORD_LENGTH = 12

function readSeedEnv(): { email: string; password: string } | null {
	const email = process.env.SEED_SUPERADMIN_EMAIL?.trim()
	const password = process.env.SEED_SUPERADMIN_PASSWORD

	if (!email && !password) {
		console.warn(
			'[seed] SEED_SUPERADMIN_EMAIL and SEED_SUPERADMIN_PASSWORD are unset; skipping superadmin seed.'
		)
		return null
	}

	if (!email || !password) {
		throw new Error(
			'[seed] Set both SEED_SUPERADMIN_EMAIL and SEED_SUPERADMIN_PASSWORD, or omit both to skip seeding.'
		)
	}

	if (password.length < MIN_PASSWORD_LENGTH) {
		throw new Error(
			`[seed] SEED_SUPERADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`
		)
	}

	return { email, password }
}

async function main() {
	const creds = readSeedEnv()
	if (!creds) {
		return
	}

	const databaseUrl = process.env.DATABASE_URL?.trim()
	if (!databaseUrl) {
		throw new Error('[seed] DATABASE_URL is required when seed credentials are set.')
	}

	const adapter = new PrismaPg({ connectionString: databaseUrl })
	const prisma = new PrismaClient({ adapter })

	try {
		const { email, password } = creds

		const existing = await prisma.user.findUnique({ where: { email } })

		if (existing) {
			console.log(`[seed] SuperAdmin already exists: ${email} (id=${existing.id})`)
			return
		}

		const hashedPassword = await argon2.hash(password)

		const user = await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				role: UserRole.SUPERADMIN,
				scope: null,
			},
		})

		console.log(`[seed] SuperAdmin created: ${email} (id=${user.id})`)
		console.log('[seed] Change this password after first login in production.')
	} finally {
		await prisma.$disconnect()
	}
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})
