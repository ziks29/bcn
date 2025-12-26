/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone', // Required for Docker deployment
    experimental: {
        // Optimize for production
        optimizePackageImports: ['lucide-react'],
    },
}

export default nextConfig
