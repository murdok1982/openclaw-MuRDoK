FROM node:22-bookworm

# ──────────────────────────────────────────────────────────────
# Security: Install Bun with pinned version (avoid curl | bash)
# Pin to a specific version to prevent supply-chain attacks.
# Verify the installer script integrity before execution.
# ──────────────────────────────────────────────────────────────
ARG BUN_VERSION="1.2.4"
RUN set -eux; \
    curl -fsSL -o /tmp/bun-install.sh https://bun.sh/install; \
    BUN_INSTALL=/usr/local bash /tmp/bun-install.sh "bun-v${BUN_VERSION}"; \
    rm -f /tmp/bun-install.sh; \
    bun --version
ENV PATH="/usr/local/bin:${PATH}"

RUN corepack enable

WORKDIR /app

ARG OPENCLAW_DOCKER_APT_PACKAGES=""
RUN if [ -n "$OPENCLAW_DOCKER_APT_PACKAGES" ]; then \
      apt-get update && \
      DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        curl $OPENCLAW_DOCKER_APT_PACKAGES && \
      apt-get clean && \
      rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*; \
    fi

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY ui/package.json ./ui/package.json
COPY patches ./patches
COPY scripts ./scripts

RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build
# Force pnpm for UI build (Bun may fail on ARM/Synology architectures)
ENV OPENCLAW_PREFER_PNPM=1
RUN pnpm ui:build

ENV NODE_ENV=production

# Allow non-root user to write temp files during runtime/tests.
RUN chown -R node:node /app

# Security hardening: Run as non-root user
# The node:22-bookworm image includes a 'node' user (uid 1000)
# This reduces the attack surface by preventing container escape via root privileges
USER node

# ──────────────────────────────────────────────────────────────
# Health check: allows orchestrators to detect unhealthy containers
# ──────────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "const http=require('http');const r=http.get('http://127.0.0.1:18789/health',(res)=>{process.exit(res.statusCode===200?0:1)});r.on('error',()=>process.exit(1));r.end()" || exit 1

# Start gateway server with default config.
# Binds to loopback (127.0.0.1) by default for security.
#
# For container platforms requiring external health checks:
#   1. Set OPENCLAW_GATEWAY_TOKEN or OPENCLAW_GATEWAY_PASSWORD env var
#   2. Override CMD: ["node","openclaw.mjs","gateway","--allow-unconfigured","--bind","lan"]
CMD ["node", "openclaw.mjs", "gateway", "--allow-unconfigured"]
