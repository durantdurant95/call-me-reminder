#!/bin/bash

# Get local pnpm store path
PNPM_STORE=$(pnpm store path)

echo "Using pnpm store from: $PNPM_STORE"

# Build with the local store mounted
DOCKER_BUILDKIT=1 docker build \
  --secret id=pnpm-store,src="$PNPM_STORE" \
  -t call-me-reminder-frontend \
  ./frontend

echo "Build complete! Now run: docker-compose up"
