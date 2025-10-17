# ft_transcendence-starter

Starter project for ft_transcendence:
- Fastify backend (TypeScript)
- SQLite database
- Frontend: Vite + TypeScript + Tailwind
- Socket.IO for realtime scaffolding
- nginx reverse proxy with HTTPS (self-signed certs)
- Single command: `docker compose up --build`

## Quick start

1. Generate self-signed certs (or provide your own):
   ```bash
   ./gen-certs.sh
   ```

2. Build and run:
   ```bash
   docker compose up --build
   ```

3. Open https://localhost in Firefox and accept the self-signed certificate.
