# ---- Build stage ----
FROM node:24-alpine AS builder

# Install pnpm directly — corepack proxy doesn't set npm_config_user_agent correctly
RUN npm install -g pnpm@11.3.0 --no-fund --no-audit

WORKDIR /app

# Disable the pnpm-only preinstall guard (it runs inside Docker, always with pnpm)
ENV CI=true

# Copy workspace manifests first for better layer caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY tsconfig.base.json tsconfig.json ./

# Package manifests
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/qualitylab/package.json ./artifacts/qualitylab/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/db/package.json ./lib/db/
COPY scripts/package.json ./scripts/

# Install all dependencies
# --no-frozen-lockfile: resolve Linux-specific native pkgs missing from macOS lockfile
# --config.strictDepBuilds=false: bypass pnpm 11's "approve-builds" gate for esbuild
RUN pnpm install --no-frozen-lockfile --config.strictDepBuilds=false

# Copy full source
COPY . .

# Build frontend (PORT unused during build, BASE_PATH=/ for asset paths)
RUN BASE_PATH=/ pnpm --filter @workspace/qualitylab run build

# Build API (bundles all deps via esbuild)
RUN pnpm --filter @workspace/api-server run build

# ---- Runtime stage ----
FROM node:24-alpine AS runner

WORKDIR /app

# Copy only the compiled outputs
COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=builder /app/artifacts/qualitylab/dist/public ./artifacts/qualitylab/dist/public

ENV NODE_ENV=production

# Railway injects PORT automatically
EXPOSE 3000

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
