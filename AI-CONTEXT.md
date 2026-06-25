# AI Development Context - Smart Clinic

## Project Overview
A modern pediatric clinic management system built with the TanStack ecosystem.

## Technical Decisions
1. **Why TanStack Start?** Full-stack React with excellent TypeScript support
2. **Why TanStack Query?** For robust server state management with suspense
3. **Why Drizzle?** Type-safe ORM with excellent SQL support
4. **Why Better-Auth?** Flexible authentication with built-in RBAC

## Code Conventions
- Use `createServerFn` for all server operations
- Export query options as `getXQueryOptions` or `XOptions`
- Use `useSuspenseQuery` for data fetching
- Implement Zod schemas in `schemas.ts` files
- Feature modules should be self-contained

## Common Patterns
1. Query keys follow the pattern: `[entity, 'list', filters]`
2. Mutations use the `onSuccess` callback for cache invalidation
3. Forms use `useAppForm` with `validators` for validation
4. Tables use `useDataTable` for URL-sync filtering

## Project-Specific Terms
- MRN: Medical Record Number
- LMS: Lambda-Mu-Sigma (WHO growth reference)
- Z-Score: Standard deviation from mean
- Encounter: Patient visit/consultation

## Important Files to Know
- src/lib/query-client.ts - Core Query configuration
- src/lib/clinic.store.ts - Global state management
- src/routeTree.gen.ts - Auto-generated router tree
- src/functions/get-user.ts - Auth middleware pattern
