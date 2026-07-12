# AGENTS.md

## Cursor Cloud specific instructions

Journal Thingy is a single full-stack **SvelteKit 2 + Svelte 5** app (auth via `better-auth` email-OTP, Drizzle ORM over an embedded **libSQL/SQLite** file, TipTap editor). There is no separate database server. Standard scripts live in `package.json` (`dev`, `build`, `check`, `lint`, `db:push`, etc.).

### Package manager
- Use **bun** (`bun.lock`; `.npmrc` sets `engine-strict=true`; the README documents bun). A stray `package-lock.json` also exists — ignore it and prefer bun.
- `bun` is installed at `~/.bun/bin` and added to `PATH` via `~/.bashrc`. It is available in login shells; if a script can't find `bun`, ensure `~/.bun/bin` is on `PATH`.

### Required environment (`.env`, gitignored)
The app throws at startup if `DATABASE_URL` is unset. A working local `.env` needs at minimum:
```
DATABASE_URL=file:local.db
ORIGIN="http://localhost:5173"
BETTER_AUTH_SECRET="<32+ char string>"
```
`RESEND_API_KEY` and `UPLOADTHING_TOKEN` are optional (see below). Recreate this file if it is ever missing.

### Database
- Local SQLite file `local.db` (gitignored). Initialize/sync the schema with `bunx drizzle-kit push --force`.
- Do NOT use `bun run db:push` in non-interactive shells: plain `drizzle-kit push` opens an interactive TTY confirmation prompt and fails with "Interactive prompts require a TTY". The `--force` flag makes it non-interactive.

### Auth / email during testing
- Login is **email + 6-digit OTP** (no password UI). With `RESEND_API_KEY` unset, OTP codes are **printed to the dev-server console** instead of emailed (look for a line like `OTP: 123456`). Read the dev server output to grab the code and complete sign-in. Signing in creates the user on first use; new users are routed through `/onboarding` before reaching the main timeline at `/`.

### Optional external services
- `RESEND_API_KEY` / `EMAIL_FROM`: real OTP emails via Resend (falls back to console logging).
- `UPLOADTHING_TOKEN`: only needed to test image attachment uploads.

### Run / lint / check
- Dev server: `bun run dev` (Vite, port 5173).
- `bun run lint` (`prettier --check` + `eslint`) and `bun run check` (`svelte-check`) currently report **pre-existing** failures — many files are unformatted and there is one type error in `src/routes/onboarding/+page.svelte`. These are existing repo issues, not environment problems; do not mass-reformat unless asked.
