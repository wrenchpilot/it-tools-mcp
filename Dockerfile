# Multi-stage build for smaller production image
FROM node:lts-bookworm-slim AS builder

WORKDIR /app

# Copy only necessary files for build (in order of change frequency)
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (this layer will be cached unless package.json changes)
# Use `npm ci` when a lockfile exists for reproducible installs; otherwise fall back
# to `npm install` so Docker builds don't fail when a lockfile isn't present.
RUN if [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund; \
    else \
      npm install --no-audit --no-fund; \
    fi

# Copy source code (this layer will be cached unless source changes)
COPY src/ ./src/

# Build the application (Docker-safe build without manifest sync)
RUN npm run build:docker

# Production stage
FROM node:lts-bookworm-slim AS production

WORKDIR /app

# Required MCP annotation
LABEL io.modelcontextprotocol.server.name="io.github.wrenchpilot/it-tools-mcp"

# Copy package files
COPY package*.json ./

# Install only production dependencies
# Try `npm ci` first (reproducible). If it fails for any reason (missing/invalid lockfile),
# fall back to `npm install` so the Docker build doesn't fail.
RUN if [ -f package-lock.json ]; then \
      npm ci --only=production --no-audit --no-fund; \
    else \
      echo "Error: package-lock.json not found. Aborting build for reproducibility."; \
      exit 1; \
    fi && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/build ./build
# Use Debian-compatible tools/options (node:slim is Debian-based). `adduser`/`addgroup`
# short options differ across distros (Alpine vs Debian) which causes the "ambiguous"
# option errors. Use `groupadd`/`useradd` with explicit options for clarity and portability
RUN groupadd -g 1001 nodejs && \
  useradd -u 1001 -g nodejs -M -r -s /usr/sbin/nologin mcp

# Change ownership of the app directory
RUN chown -R mcp:nodejs /app

# Switch to non-root user
USER mcp

# Set environment variables
ENV NODE_ENV=production

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "process.exit(0)" || exit 1

# Start the application
CMD ["node", "build/index.js"]
