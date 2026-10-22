# Air Rental

Customer frontend for daily air-conditioner rental. Next.js App Router, with Cache Components enabled.

## Scripts

```bash
npm run dev
npm run lint
npm run build
```

## Layout

```
src/app            routes, layouts, loading and error UI
src/components     shared shell and controls
src/features       catalog and booking, each with its own types and UI
src/config         site copy and navigation
src/lib            small shared helpers
```

Pages stay thin. Catalog reads go through `src/features/catalog/queries.ts`. Booking validation lives in `src/features/booking/validation.ts`, and the form posts to a server action.
