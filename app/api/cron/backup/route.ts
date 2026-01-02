import { NextRequest, NextResponse } from "next/server"
import { getBackupData } from "@/lib/backup.service"
import fs from "fs"
import path from "path"

export async function GET(req: NextRequest) {
    // Check API Key
    const apiKey = req.nextUrl.searchParams.get("key")
    const envApiKey = process.env.ADMIN_SECRET

    // If no secret is set in env, disable this route for security
    if (!envApiKey) {
        return NextResponse.json({ error: "ADMIN_SECRET not configured on server" }, { status: 500 })
    }

    if (apiKey !== envApiKey) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        console.log("[Backup] Starting automated backup...")
        const backupData = await getBackupData()
        const jsonContent = JSON.stringify(backupData, null, 2)

        const backupDir = path.join(process.cwd(), "backups")

        // Ensure backup directory exists
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true })
        }

        // Save file
        const filename = `backup_${new Date().toISOString().split('T')[0]}.json`
        const filepath = path.join(backupDir, filename)
        fs.writeFileSync(filepath, jsonContent)

        console.log(`[Backup] Saved to ${filepath}`)

        // Prune old backups (keep last 7)
        const files = fs.readdirSync(backupDir)
            .filter(f => f.startsWith("backup_") && f.endsWith(".json"))
            .sort() // Sorts by date due to naming convention
            .reverse() // Newest first

        if (files.length > 7) {
            const toDelete = files.slice(7)
            toDelete.forEach(file => {
                fs.unlinkSync(path.join(backupDir, file))
                console.log(`[Backup] Pruned old backup: ${file}`)
            })
        }

        return NextResponse.json({ success: true, filename })
    } catch (error) {
        console.error("[Backup] Failed:", error)
        return NextResponse.json({ error: "Backup failed" }, { status: 500 })
    }
}
