# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
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
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy Prisma schema first
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

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
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
