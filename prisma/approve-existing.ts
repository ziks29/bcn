import { prisma } from '../lib/prisma.js';

async function approveExistingUsers() {
    const result = await prisma.user.updateMany({
        where: { approved: false },
        data: { approved: true }
    });

    console.log(`Approved ${result.count} existing users`);
    process.exit(0);
}

approveExistingUsers();
