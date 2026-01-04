import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function restore() {
    const args = process.argv.slice(2)
    if (args.length === 0) {
        console.error('Please provide the path to the backup file.')
        console.error('Usage: npx tsx prisma/restore.ts <path-to-backup.json>')
        process.exit(1)
    }

    const backupPath = args[0]
    if (!fs.existsSync(backupPath)) {
        console.error(`File not found: ${backupPath}`)
        process.exit(1)
    }

    const backupContent = fs.readFileSync(backupPath, 'utf-8')
    const backup = JSON.parse(backupContent)

    if (!backup.data) {
        console.error('Invalid backup format: missing "data" property.')
        process.exit(1)
    }

    const { users, articles, ads, galleryItems, categories, contacts, notifications, excalidrawBoards, excalidrawSnapshots } = backup.data

    console.log('Starting restore...')

    // 1. Users
    if (users?.length) {
        console.log(`Restoring ${users.length} users...`)
        for (const user of users) {
            await prisma.user.upsert({
                where: { id: user.id },
                update: { ...user },
                create: { ...user },
            })
        }
    }

    // 2. Categories
    if (categories?.length) {
        console.log(`Restoring ${categories.length} categories...`)
        for (const category of categories) {
            await prisma.category.upsert({
                where: { id: category.id },
                update: { ...category },
                create: { ...category },
            })
        }
    }

    // 3. Articles
    if (articles?.length) {
        console.log(`Restoring ${articles.length} articles...`)
        for (const article of articles) {
            // Remove include if it was present in export, though export was raw findMany
            // We ensure we don't try to write relate objects if they are just IDs
            const { author, ...articleData } = article
            await prisma.article.upsert({
                where: { id: article.id },
                update: { ...articleData },
                create: { ...articleData },
            })
        }
    }

    // 4. Ads
    if (ads?.length) {
        console.log(`Restoring ${ads.length} ads...`)
        for (const ad of ads) {
            await prisma.ad.upsert({
                where: { id: ad.id },
                update: { ...ad },
                create: { ...ad },
            })
        }
    }

    // 5. Contacts
    if (contacts?.length) {
        console.log(`Restoring ${contacts.length} contacts...`)
        for (const contact of contacts) {
            await prisma.contact.upsert({
                where: { id: contact.id },
                update: { ...contact },
                create: { ...contact },
            })
        }
    }

    // 6. Gallery Items
    if (galleryItems?.length) {
        console.log(`Restoring ${galleryItems.length} gallery items...`)
        for (const item of galleryItems) {
            await prisma.galleryItem.upsert({
                where: { id: item.id },
                update: { ...item },
                create: { ...item },
            })
        }
    }

    // 7. Notifications
    if (notifications?.length) {
        console.log(`Restoring ${notifications.length} notifications...`)
        for (const notification of notifications) {
            await prisma.notification.upsert({
                where: { id: notification.id },
                update: { ...notification },
                create: { ...notification },
            })
        }
    }

    // 8. Excalidraw Boards
    if (excalidrawBoards?.length) {
        console.log(`Restoring ${excalidrawBoards.length} Excalidraw boards...`)
        for (const board of excalidrawBoards) {
            await prisma.excalidrawBoard.upsert({
                where: { id: board.id },
                update: { ...board },
                create: { ...board },
            })
        }
    }

    // 9. Excalidraw Snapshots
    if (excalidrawSnapshots?.length) {
        console.log(`Restoring ${excalidrawSnapshots.length} Excalidraw snapshots...`)
        for (const snapshot of excalidrawSnapshots) {
            await prisma.excalidrawSnapshot.upsert({
                where: { id: snapshot.id },
                update: { ...snapshot },
                create: { ...snapshot },
            })
        }
    }

    console.log('Restore completed successfully.')
}

restore()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
