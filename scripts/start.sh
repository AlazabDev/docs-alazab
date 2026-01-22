#!/usr/bin/env bash
set -e

# Ensure dependencies are installed (use frozen lockfile for reproducible installs)
if command -v pnpm >/dev/null 2>&1; then
  echo "Installing dependencies via pnpm..."
  pnpm install --frozen-lockfile || pnpm install
else
  echo "pnpm not found. Please install pnpm >=10."
fi

# Build the application
echo "Building application..."
pnpm run build

# Start with PM2 if available, otherwise fallback to nuxt preview
if command -v pm2 >/dev/null 2>&1; then
  echo "Starting with pm2..."
  # Try to start, if process exists attempt restart
  pm2 start ecosystem.config.js --env production || pm2 restart alazab-dashboard || pm2 start ecosystem.config.js --name alazab-dashboard --env production
  pm2 save
else
  echo "pm2 not found, running nuxt preview"
  pnpm run preview
fi

exit 0
