FROM oven/bun:1.1-slim

WORKDIR /app

COPY package.json ./
RUN bun install

COPY . .
RUN bun run build

CMD ["bun", "run", "dist/index.js"]
