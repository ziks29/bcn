import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const username = 'admin'
    const newPassword = 'admin123'
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    try {
        const user = await prisma.user.update({
            where: { username },
            data: { password: hashedPassword }
        })
        console.log(`Successfully reset password for user: ${user.username}`)
        console.log(`New password is: ${newPassword}`)
    } catch (error) {
        console.error('Error resetting password:', error)
        console.log('Maybe the admin user does not exist? Check your database.')
    } finally {
        await prisma.$disconnect()
    }
}

main()
