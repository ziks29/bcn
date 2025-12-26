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
RUN if [ -f pnpm-lock.yaml ]; then \
    corepack enable && \
    corepack prepare pnpm@latest --activate && \
    pnpm run build; \
    else \
    npm run build; \
    fi

# Stage 3: Runner
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
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
# Copy Prisma Client (pnpm stores it in .pnpm directory)
COPY --from=builder /app/node_modules/.pnpm ./node_modules/

# Ensure entrypoint is executable in runner
USER root
RUN chmod +x entrypoint.sh
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "server.js"]
