export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV === 'production') {
        // Run once a day
        const ONE_DAY = 24 * 60 * 60 * 1000

        // Helper to trigger backup
        const triggerBackup = async () => {
            const apiKey = process.env.ADMIN_SECRET
            if (!apiKey) {
                console.warn("[Scheduler] ADMIN_SECRET not set, skipping backup")
                return
            }

            try {
                // We call our own API route to keep logic centralized and testable via API
                // Assuming localhost since it's internal
                const port = process.env.PORT || 3000
                const url = `http://localhost:${port}/api/cron/backup?key=${apiKey}`

                console.log("[Scheduler] Triggering backup...")
                await fetch(url)
            } catch (error) {
                console.error("[Scheduler] Backup trigger failed:", error)
            }
        }

        // Set interval
        setInterval(triggerBackup, ONE_DAY)

        // Initial run after start (optional, maybe wait 1 min to let server start)
        // setTimeout(triggerBackup, 60000) 
        console.log("[Scheduler] Backup scheduler started")
    }
}
