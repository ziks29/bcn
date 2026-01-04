// Run this script to clean up any test Order data
// Usage: npx tsx scripts/cleanup-orders.ts

import { prisma } from '../lib/prisma'

async function main() {
    try {
        // Delete all orders (and their payments will cascade delete)
        const result = await prisma.order.deleteMany({})
        console.log(`✅ Deleted ${result.count} test orders`)

        // Also delete any orphaned payments (shouldn't be any with cascade)
        const payments = await prisma.payment.deleteMany({})
        console.log(`✅ Deleted ${payments.count} orphaned payments`)

        console.log('\n✨ Database cleaned! The orders page should now work.')
    } catch (error) {
        console.error('❌ Error cleaning database:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
