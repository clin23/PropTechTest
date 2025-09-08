# PropTechTest

PropTechTest is a lightweight, dashboard-first property management prototype for landlords. It provides a simple overview of a portfolio and quick access to day-to-day workflows.

## Feature overview

- **Dashboard** highlighting key portfolio metrics.
- **Finance** pages to record expenses and view profit & loss with CSV/PDF export.
- **Vendors** management and invitations.
- **Listings & Applications** with generated listing copy and applicant scoring.
- **Inspections** with room checklists and shareable reports.
- **Rent review** calculator and notice generation within each property.
- **Settings** for notification preferences.

## Navigation

A collapsible sidebar links to:

- Dashboard
- Inspections
- Applications
- Listings
- Finance (Expenses & P&L)
- Vendors
- Settings

## Environment variables

Copy `.env.local.sample` to `.env.local` and adjust as needed.

* `NEXT_PUBLIC_API_BASE` - Base URL for backend API.
* `MOCK_MODE` - Enables mocked API responses when set to `true`.
* `DATABASE_URL` - PostgreSQL connection string.
* `MAX_UPLOAD_MB` - Maximum upload size in megabytes.

### Mock API setup

When `MOCK_MODE=true` or no `NEXT_PUBLIC_API_BASE` is provided, the app serves routes under `app/api/*` using an in-memory store defined in [`app/api/store.ts`](app/api/store.ts). Data resets whenever the Next.js server restarts or when `resetStore()` is invoked. To connect to a real backend, set `NEXT_PUBLIC_API_BASE` and unset `MOCK_MODE`.

## Database setup

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

### Persistence mode

To use Prisma with PostgreSQL instead of the in-memory mock store, set `MOCK_MODE=false` and ensure `DATABASE_URL` points to a running database. Apply migrations and seed demo data with:

```bash
npm run db:migrate
npm run db:seed
```

Setting `MOCK_MODE=true` switches back to the in-memory store.

### Seeding demo data

Populate the database with demo data:

```bash
npx prisma migrate deploy
npm run seed
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

### Exporting finance reports

From the finance pages (`/finance/[propertyId]/pnl` or `/finance/[propertyId]/expenses`) use the **Export** buttons to download CSV or PDF reports.

