# syntax=docker/dockerfile:1

# Multi-stage build producing a slim, standalone Next.js image.
# Works on any Docker host (Coolify, Hetzner, Fly, a plain VPS, …).
#
# Database migrations are NOT run during the build (the build has no DB access).
# Run them as a separate release/pre-deploy step, e.g. `pnpm db:migrate`
# (see README "Deployment").

FROM node:20-alpine AS base
RUN npm install -g pnpm@9

# --- Dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Placeholder build-time env. Override NEXT_PUBLIC_* via build args for real
# deployments — they are inlined into the client bundle at build time.
ARG NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL} \
    POSTGRES_URL="postgresql://user:pass@localhost:5432/db" \
    BETTER_AUTH_SECRET="build-only-placeholder-secret-32chars"
RUN pnpm build:ci

# --- Runtime ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
