# PropTechTest

## Database Setup

Ensure `DATABASE_URL` is set to your PostgreSQL connection string. To create the schema run:

```bash
psql $DATABASE_URL -f db/schema.sql
```

To rollback:

```bash
psql $DATABASE_URL -f db/rollback.sql
```

Alternatively, use the provided Makefile:

```bash
make db-create
make db-drop
make migrate-dev
make seed
make reset
```

## Development

### Tests

Install Playwright browsers and run the end-to-end tests:

```bash
npm install
npx playwright install
npm test
```

### Next.js app

Install dependencies and start the development server with mocked APIs:

```bash
npm install
npm run dev
```

The app uses `NEXT_PUBLIC_API_BASE` to talk to the backend. By default it points to the local API routes under `app/api/*`. To connect to a real Phase‑1 backend set:

```bash
export NEXT_PUBLIC_API_BASE=http://localhost:3001
```

and restart the dev server.

### Mock API store

During Phase‑2 development the routes under `app/api` use an in‑memory store
defined in [`app/api/store.ts`](app/api/store.ts). The data resets whenever the
Next.js server restarts or when `resetStore()` is called. Once a real backend
is available, point `NEXT_PUBLIC_API_BASE` to it and remove or replace the
mock API routes to disable the in‑memory store.

