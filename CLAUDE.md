# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

- `npm run dev` — start Next.js dev server
- `npm run build` — production build
- `npm run lint` — run ESLint via `next lint`
- `npm install --legacy-peer-deps` — **always** use `--legacy-peer-deps` flag when installing packages
- `npx prisma generate` — regenerate Prisma client after schema changes
- `npx prisma migrate dev` — run migrations (**ask user for confirmation before executing**)
- `npx prisma studio` — open Prisma Studio GUI

## Architecture

Next.js 16 App Router project (TypeScript, React 18) with two distinct route groups:

- **`app/[locale]/`** — Public-facing pages with i18n (locales: `en`, `zh-tw`). Uses `next-intl` with `NextIntlClientProvider`. Locale files at `public/locales/{en,zh-tw}.json`.
- **`app/sys-console/`** — Admin panel. Protected routes under `(protected)/` use NextAuth session check (JWT strategy, LINE provider). Auth config in `lib/auth.ts`. Admin layout imports Pico CSS directly.

### Key Libraries & Patterns

- **Styling**: Pico CSS for semantic HTML styling + CSS Modules (`.module.css`) for custom styles. No inline `style={{}}` attributes. Icons from `remixicon`.
- **Database**: PostgreSQL via Prisma ORM with `pg` adapter (`lib/db.ts`). Schema at `prisma/schema.prisma`.
- **i18n**: All user-facing text must go through `next-intl` / locale JSON files. No hardcoded strings. The `lib/getMessages.ts` loads from `public/locales/` JSON files.
- **Forms**: React Hook Form with `zod` validation. Subcomponents use `useFormContext`.
- **Drag & Drop**: `@dnd-kit` for sortable UI (used in game levels, itinerary days).
- **Auth**: NextAuth v5 beta with Prisma adapter, LINE OAuth provider, JWT sessions. Whitelist-based (user must exist in DB).

### Data Models

Two main feature domains in `prisma/schema.prisma`:
- **Game**: `Game` → `Level` → `LevelDetail` (with `ActionType` enum: IMAGE, IOT)
- **Itinerary**: `ItineraryTrip` → `ItineraryDay` → `ItineraryItem` (trip planning with timeline)

Query helpers in `lib/itinerary.ts` return serialized DTOs (dates as ISO strings).

### Path Alias

`@/*` maps to project root (configured in `tsconfig.json`).

## Style & Code Conventions (from .github/copilot-instructions.md)

- No inline styles — use CSS Modules for customization
- Animations via Animate.css classes only
- All modals must have open/close animations
- Font sizes must not exceed `h1`
- Containers/buttons should be as compact as possible while fitting content
- Borders/shadows use theme color variables (e.g., `var(--primary-300)`), not gray
- Every page must export `metadata` with a `title`
- Theme colors: warm milk-tea/coffee palette (primary) + olive green (secondary), defined in `app/globals.css`
