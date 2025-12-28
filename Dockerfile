# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl openssl-dev
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* package-lock.json* ./

# Install dependencies (supports both npm and pnpm)
RUN if [ -f pnpm-lock.yaml ]; then \
    corepack enable && \
    corepack prepare pnpm@latest --activate && \
    pnpm install --frozen-lockfile; \
    else \
    npm ci; \
    fi

# Stage 2: Builder
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl openssl-dev
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-lock.yaml* ./

# Copy Prisma schema first
COPY prisma ./prisma

# Generate Prisma Client
RUN if [ -f pnpm-lock.yaml ]; then \
    corepack enable && \
    corepack prepare pnpm@latest --activate && \
    npx prisma generate; \
    else \
    npx prisma generate; \
    fi

# Copy the rest of the application
COPY . .

# Make entrypoint script executable
RUN chmod +x entrypoint.sh

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
# Set dummy build-time environment variables
# These will be overridden at runtime by the actual .env file
ENV DATABASE_URL="file:./prisma/dev.db"
ENV NEXTAUTH_URL="http://localhost:3000"
ENV NEXTAUTH_SECRET="build-time-secret-will-be-overridden-at-runtime"

RUN if [ -f pnpm-lock.yaml ]; then \
    corepack enable && \
    corepack prepare pnpm@latest --activate && \
    pnpm run build; \
    else \
    npm run build; \
    fi

# Stage 3: Runner
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl su-exec
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh

# Install Prisma CLI globally so it's available in the runner
RUN npm install -g prisma@5.22.0

# Ensure prisma directory exists
RUN mkdir -p /app/prisma

# Ensure entrypoint is executable
USER root
RUN chmod +x entrypoint.sh

# Do NOT switch to nextjs user here, we will use su-exec in entrypoint.sh 
# to fix volume permissions at runtime and then drop privileges.

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "server.js"]
