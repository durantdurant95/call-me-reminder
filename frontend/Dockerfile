# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files first (better caching)
COPY package.json pnpm-lock.yaml ./

# Install dependencies using cache mount
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Run the application
CMD ["pnpm", "dev"]