# personal-website

Next.js TypeScript project scaffolded with i18n support (en, zh-TW) and Prisma schema for DB-driven translations.

Quick start (after installing dependencies):

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Install dependencies:

```bash
npm install
```

3. Initialize Prisma and run migration:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Run dev server:

```bash
npm run dev
```

Visit `http://localhost:3000/en` or `/zh-TW`.

Docker (local development)

1. Build and start services (db + redis + app):

```bash
docker-compose up --build
```

2. The Dockerfile sets a build-time `DATABASE_URL` build-arg to avoid Prisma errors during image build. Migrations are executed at container start by `docker-entrypoint.sh` which runs `npx prisma migrate deploy` (skipped if no `DATABASE_URL`).

Notes:

-   For local development the `docker-compose.yml` passes `DATABASE_URL` pointing to the `db` service.
-   If you prefer migrations during development to use `prisma migrate dev`, run them manually from a shell inside the container or replace the entrypoint commands.

Secrets and invocation notes

-   `INVOKE_SECRET`: set an invocation secret in your `.env` as `INVOKE_SECRET` to protect the internal trigger endpoint.
-   The app route `POST /api/trigger` expects header `x-invoke-secret` equal to `INVOKE_SECRET`.
-   If a `LevelDetail` has `actionType = IOT` the route forwards a POST to the URL stored in `LevelDetail.content` with header `X-Trigger-Secret: <INVOKE_SECRET>` and the provided payload.

GitHub Actions

-   Add repository secrets in GitHub with the name `INVOKE_SECRET` (and other secrets as needed) so workflows can call internal endpoints or deploy safely.
