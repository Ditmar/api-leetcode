#------- Stage 1: Build the application
FROM node:22.20-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and config files needed for build
COPY tsconfig.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client, build TypeScript, and prune devDependencies
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate && npm run build && npm prune --omit=dev && npm cache clean --force

#------- Stage 2: Production image
FROM node:22.20-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

# Copy production node_modules, built app, Prisma files, and config
COPY --chown=node:node package.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node prisma.config.ts ./
COPY --chown=node:node prisma ./prisma
COPY --chown=node:node config ./config

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
