FROM oven/bun:1.1-slim AS builder

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install

COPY . .
RUN bun run build

# --- Production stage ---
FROM oven/bun:1.1-slim

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --production

COPY --from=builder /app/dist ./dist

CMD ["bun", "run", "dist/index.js"]
