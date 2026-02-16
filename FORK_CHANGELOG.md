# 📝 Changelog — openclaw-MuRDoK Fork

All notable changes specific to this fork are documented here.
This project is a fork of [openclaw/openclaw](https://github.com/openclaw/openclaw).

## [Unreleased] — 2026-02-16

### 🔒 Security Hardening

- **Dockerfile**: Replaced unsafe `curl | bash` Bun install with pinned version (`BUN_VERSION` build arg)
- **Dockerfile**: Added `HEALTHCHECK` instruction for container orchestration
- **docker-compose.yml**: Documented `CLAUDE_*` session keys as optional with security warnings
- **docker-compose.yml**: Added default empty values (`:-`) to prevent crashes on missing env vars
- **docker-compose.yml**: Added health checks for automated container monitoring
- **docker-compose.yml**: Added internal Docker network for service isolation
- **docker-compose.yml**: Added resource limits (memory/CPU) to prevent DoS by resource exhaustion
- **.gitignore**: Added `fly.private.toml` and `*.private.toml` to prevent infrastructure leaks
- **.gitignore**: Added `.env.production` and `.env.local` to protection rules
- **CONTRIBUTING.md**: Added commit signing (GPG/SSH) documentation and enforcement recommendation

### 📚 Documentation

- **README.md**: Added "Security Hardening Applied" section documenting all improvements
- **FORK_CHANGELOG.md**: Created this file to track fork-specific changes
- **CONTRIBUTING.md**: Added security-first contribution guidelines

### 🏗️ Infrastructure

- **`.github/workflows/sync-upstream.yml`**: Added automated upstream sync workflow (weekly + manual)
