# Multi-stage build for smaller production image
FROM node:slim AS builder

WORKDIR /app

# Copy only necessary files for build (in order of change frequency)
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (this layer will be cached unless package.json changes)
RUN npm ci

# Copy source code (this layer will be cached unless source changes)
COPY src/ ./src/

# Build the application (Docker-safe build without manifest sync)
RUN npm run build:docker

# Production stage
FROM node:slim AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/build ./build

# Create non-root user for security
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
