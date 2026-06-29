FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --ignore-scripts
RUN pnpm rebuild esbuild

COPY . .
RUN node_modules/.bin/svelte-kit sync && DATABASE_URL=postgresql://build:build@localhost:5432/build BETTER_AUTH_SECRET=build node_modules/.bin/vite build


FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/src/lib/server/db/schema ./src/lib/server/db/schema
COPY --from=builder /app/src/lib/server/db/seed.ts ./src/lib/server/db/seed.ts
COPY --from=builder /app/drizzle ./drizzle

EXPOSE 3000

# Sync schéma (préserve les données) → seed idempotent → démarrage app
CMD ["sh", "-c", "node_modules/.bin/drizzle-kit push --force && node_modules/.bin/tsx src/lib/server/db/seed.ts && node build"]
