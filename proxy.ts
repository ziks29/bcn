import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// Proxy wrapper to protect routes
export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnAdmin = req.nextUrl.pathname.startsWith("/admin")

    if (isOnAdmin) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", req.nextUrl)) // Redirect unauthenticated
        }
        // Allow all authenticated users to access admin area
        // Individual pages/actions will enforce role-specific permissions
        return
    }
})

export const config = {
    matcher: ["/admin/:path*"],
}
