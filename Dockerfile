# Multi-stage Dockerfile for Next.js + Prisma
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install dependencies (falls back to npm install if package-lock.json missing)
RUN npm ci --omit=dev || npm install

# Copy rest of source
COPY . .

# Provide a harmless build-time DATABASE_URL to avoid Prisma errors during build
ARG DATABASE_URL="file:dev.db"
ENV DATABASE_URL=${DATABASE_URL}

# Generate Prisma client (does not require DB connection)
RUN npx prisma generate || true

# Build Next.js app
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built assets and node_modules
COPY --from=builder /app/.next .next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.next/standalone .

# Copy entrypoint that will run migrations at container start
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000
CMD ["./docker-entrypoint.sh"]
