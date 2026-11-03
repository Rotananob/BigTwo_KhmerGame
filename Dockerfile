# Stage 1: Build Frontend and Backend
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package definitions
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm --prefix server install
RUN npm --prefix client install

# Copy source code
COPY shared ./shared
COPY server ./server
COPY client ./client

# Build both client and server
RUN npm --prefix server run build
RUN npm --prefix client run build

# Stage 2: Production Runtime
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 3001
CMD ["node", "server/dist/server/src/server.js"]
