/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone', // Required for Docker deployment
    experimental: {
        // Optimize for production
        optimizePackageImports: ['lucide-react'],
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },
}

export default nextConfig
