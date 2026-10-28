# Multi-stage Dockerfile for Engineering Lifecycle Playbook
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

# Create data directory for SQLite persistence
RUN mkdir -p /app/data && chown -R node:node /app

COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/server.ts ./server.ts

USER node
EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]
