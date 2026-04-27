# GovernData Frontend Portal (`governdata-fe`)

Next.js developer portal for GovernData APIs, onboarding, documentation, key management pages, and integration snippets.

## Prerequisites

- Node.js 20+ (Node 22 recommended)
- npm 10+
- Running `governdata` backend API (default `http://localhost:8080`)

## Environment setup

1. Copy template:

```bash
cp .env.example .env.local
```

2. Verify values:

```bash
NEXT_PUBLIC_GOVERNANCE_API_URL=http://localhost:8080
GOVERNANCE_JWT_SECRET=change-me-dev-jwt-secret-32chars-min!!
GOVERNANCE_JWT_EXPIRATION_SECONDS=86400
GOVERNANCE_PUBLIC_BASE_URL=http://localhost:8080
```

For frontend runtime, the main required variable is `NEXT_PUBLIC_GOVERNANCE_API_URL`.

## Install and run

```bash
npm install
npm run dev
```

App URL: [http://localhost:3000](http://localhost:3000)

## Build and run production mode

```bash
npm run build
npm run start
```

## Run-to-completion flow

1. Start `governdata` backend.
2. Start this frontend.
3. Verify pages:
   - `/`
   - `/login`
   - `/register`
   - `/docs`
   - `/dashboard`
4. Validate API-backed pages with real auth/session flow.

## Related docs

- Governance backend setup: `../governdata/README.md`
- API guides: `../governdata/docs/developer-platform-api-guide.md`
