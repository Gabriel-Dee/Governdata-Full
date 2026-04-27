# EHR/EMR Frontend (`ehr-emr-fe`)

Next.js frontend for clinical workflows (patients, encounters, diagnoses, medications, admin import, analytics).

## Prerequisites

- Node.js 20+ (Node 22 recommended)
- npm 10+ (or compatible package manager)
- Running EHR backend (`ehr-emr-be`) on `http://localhost:8080` (default)

## Environment setup

1. Copy the template:

```bash
cp .env.example .env.local
```

2. Confirm backend URL in `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## Install and run

```bash
npm install
npm run dev
```

App URL: [http://localhost:3000](http://localhost:3000)

## Build for production

```bash
npm run build
npm run start
```

## Typical run-to-completion flow

1. Start `governdata` (governance backend) if your EHR backend is configured to enforce governance.
2. Start `ehr-emr-be`.
3. Start this frontend.
4. Login with seeded/demo user from backend docs.
5. Validate core pages:
   - `/dashboard`
   - `/patients`
   - `/encounters`
   - `/diagnoses`
   - `/medications`
   - `/admin/import`
6. Confirm denied/allowed scenarios according to governance mode.

## Related module docs

- Backend integration: `../ehr-emr-be/README.md`
- Governance runbook: `../governdata/docs/experiment-runbook.md`
