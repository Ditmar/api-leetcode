#------- Stage 1. Build the application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client
RUN npx prisma generate
# Build the application
RUN npm run build
#------- Stage 2: production image
FROM node:22-alpine AS production

ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY --from=builder /app/dist ./dist

# Copy prisma Schema and generated client for runtime
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY prisma ./prisma

# Copy config files
COPY config ./config

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || '3000') + '/health/ready', { signal: AbortSignal.timeout(3000) }).then(r => process.exit(r.status === 200 ? 0 : 1)).catch(() => process.exit(1))"
CMD ["sh", "-c", "npx prisma migrate deploy && exec node dist/index.js"]
