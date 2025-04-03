# Base image with Bun
FROM oven/bun:1.0.30-alpine AS base
WORKDIR /app

# deps
COPY bun.lock package.json ./
RUN bun install

# build
COPY . .
RUN bun run build

# runner
FROM oven/bun:1.0.30-alpine AS runner
WORKDIR /app
ENV PORT=8080
ENV NODE_ENV=production

COPY --from=base /app /app

CMD ["bun", "run", "start"]
