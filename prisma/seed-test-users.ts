import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Creating test users...')

    const testUsers = [
        { username: 'admin_test', role: 'ADMIN', displayName: 'Admin Test' },
        { username: 'chief_test', role: 'CHIEF_EDITOR', displayName: 'Chief Editor Test' },
        { username: 'editor_test', role: 'EDITOR', displayName: 'Editor Test' },
        { username: 'author_test', role: 'AUTHOR', displayName: 'Author Test' },
    ]

    const password = 'test123'
    const hashedPassword = await bcrypt.hash(password, 10)

    for (const user of testUsers) {
        const existing = await prisma.user.findUnique({
            where: { username: user.username }
        })

        if (existing) {
            console.log(`User ${user.username} already exists, skipping...`)
            continue
        }

        await prisma.user.create({
            data: {
                username: user.username,
                displayName: user.displayName,
                password: hashedPassword,
                role: user.role as any,
            }
        })
        console.log(`✓ Created ${user.role}: ${user.username}`)
    }

    console.log('\nTest users created successfully!')
    console.log('Login credentials for all users:')
    console.log('Password: test123')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
