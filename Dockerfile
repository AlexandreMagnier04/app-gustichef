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

EXPOSE 3000


CMD ["node", "build"]
