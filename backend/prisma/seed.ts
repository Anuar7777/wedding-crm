import { PrismaClient, UserRole } from '@prisma/client'
import * as argon2 from 'argon2'

const prisma = new PrismaClient()

async function main() {
	const email = 'superadmin@event-crm.local'
	const password = 'superadmin123'

	const existing = await prisma.user.findUnique({ where: { email } })

	if (existing) {
		console.log(`SuperAdmin already exists: ${email}`)
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

	console.log(`SuperAdmin created:`)
	console.log(`  Email: ${email}`)
	console.log(`  Password: ${password}`)
	console.log(`  ID: ${user.id}`)
	console.log(`\n  ⚠️  Change this password immediately in production!`)
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
