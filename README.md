# Agentic Coding Starter Kit

A production-oriented starter kit for building AI-powered web apps with an agentic development workflow. It gives you a working Next.js app, authentication, PostgreSQL, Drizzle ORM, AI SDK integration, shadcn/ui components, and project instructions that help coding agents plan, split, implement, review, and verify changes.

The goal is simple: install the starter, describe the product you want to build, and let your coding agent help turn the boilerplate into your actual POC, MVP, or internal tool.

## What You Get

- **Next.js 16 and React 19** with the App Router
- **TypeScript** and a strict project setup
- **Better Auth** with email/password enabled by default
- **PostgreSQL and Drizzle ORM** for schema and migrations
- **Resend and React Email** for transactional email (with a console fallback)
- **S3-compatible object storage** (Hetzner, MinIO, AWS, R2) with a local fallback
- **React Hook Form and Zod** for forms and validation
- **Playwright** for end-to-end tests
- **Docker / Podman / Coolify-ready** deployment (standalone output + Dockerfile)
- **AI SDK and OpenRouter** for optional chat and AI features
- **shadcn/ui, Tailwind CSS, and Lucide icons** for the UI foundation
- **Agent instructions** through `AGENTS.md` and `CLAUDE.md`
- **Agent skills** for specs, implementation, reviews, security scans, UI work, and shipping

## Quick Start

Create a new app with the CLI:

```bash
npx create-agentic-app@latest my-app
cd my-app
```

Or create the app in the current directory:

```bash
npx create-agentic-app@latest .
```

Then configure and run the app:

```bash
cp env.example .env
podman compose up -d   # or: docker compose up -d
pnpm db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The CLI copies the starter files, installs dependencies with your selected package manager, and prepares the environment file. If you use `npm`, replace the `pnpm` commands above with `npm run`.

## Guided Setup with Claude Code (Optional)

If you use Claude Code, you can install the `create-agentic-app` skill and have Claude walk you through the entire setup — folder strategy, package manager, PostgreSQL (Docker / hosted / BYO), `.env` config, migrations, optional integrations (Resend email, S3 storage, OpenRouter), build verification, and dev-server check — ending at a verified `http://localhost:3000`.

Install the skill:

```bash
npx skills add stefanowitschdev/agentic-coding-starter-kit-web@create-agentic-app --agent claude-code
```

The `--agent claude-code` flag is required. Without it, the installer drops the skill into 37+ IDE adapter folders at the project root.

Once installed, ask Claude something like:

```text
Scaffold a new Agentic Coding Starter Kit project here.
```

Claude will run the skill end-to-end and ask you the few decisions it actually needs to make.

## Prerequisites

- Node.js 22 or newer (the pinned `pnpm` requires Node 22.13+)
- Git
- Docker **or** Podman (for the included PostgreSQL service and for building the deployment image). For `podman compose`, also install a compose provider (`docker-compose` or `podman-compose`).
- A package manager: `pnpm`, `npm`, or `yarn`
- Optional: a Resend API key for sending real transactional emails
- Optional: S3-compatible object storage credentials for remote file uploads
- Optional: an OpenRouter API key for AI chat features

## Environment Variables

Start from `env.example` and update values for your environment:

```env
# Database
POSTGRES_URL=postgresql://dev_user:dev_password@localhost:5432/postgres_dev

# Authentication - Better Auth
BETTER_AUTH_SECRET=your-random-secret

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Your App"

# Transactional email - Resend (optional; console fallback when unset)
RESEND_API_KEY=
EMAIL_FROM="onboarding@resend.dev"

# File storage - S3-compatible (optional; local fallback when unset)
S3_ENDPOINT=
S3_REGION="auto"
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET=
S3_PUBLIC_URL=

# AI Integration via OpenRouter (optional)
OPENROUTER_API_KEY=
OPENROUTER_MODEL="openai/gpt-5-mini"

# Optional - for vector search only
OPENAI_EMBEDDING_MODEL="text-embedding-3-large"
```

For local development, the default database URL works with the included `compose.yml`. For production, use the database URL from your hosting provider.

Generate a strong `BETTER_AUTH_SECRET` before deploying. The starter ships with a development value only so you can get moving quickly.

## Default Auth

The starter now defaults to **email and password authentication** through Better Auth. This keeps the first setup small and helps you start building POCs and MVPs without creating OAuth credentials up front.

The current auth setup includes:

- user registration
- email/password login
- protected routes
- password reset flow
- email verification flow

Email verification and password reset are wired to **Resend** through `src/lib/mail` with templates in `src/emails`. When `RESEND_API_KEY` is not set, emails are logged to the terminal instead, so you can develop without an email account. Set `RESEND_API_KEY` and `EMAIL_FROM` to send real emails in production.

### Adding Google OAuth

Google OAuth is no longer the default, but adding it back is straightforward. Ask your coding agent:

```text
Add Google OAuth to this Better Auth setup. Keep email/password login enabled, add the Google provider, update the auth UI, and document the required Google environment variables.
```

Your agent should update the Better Auth config, add the required `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` variables, and adjust the login UI.

## Build With an Agent

This starter is designed to be used with coding agents. The generated project includes instructions that tell agents how to plan, ask questions, split work, use sub-agents when useful, follow the design system, and verify changes.

- `AGENTS.md` is the main instruction file for Codex, Cursor, and other agent-compatible tools.
- `CLAUDE.md` points Claude users to the same project guidance.
- `.agents/skills/` and `.claude/skills/` include optional workflows for more specialized tasks.
- `DESIGN.md` defines the UI design system agents should follow.

The default workflow does not require slash commands or a separate spec file.

### Recommended Default Workflow

1. Install the starter and open the project in your coding-agent environment.
2. Switch your agent tool to planning mode.
3. Describe the app you want to build in plain language.
4. Let the agent ask clarifying questions and shape a clear plan.
5. Confirm the plan once the goal, scope, constraints, and success criteria are clear.
6. Switch your agent tool to edit mode.
7. Ask the agent to implement the approved plan.
8. The main agent should split the work into parallel streams, silos, or feature chunks that fit within context.
9. The agent should use sub-agents to implement those chunks in parallel where useful, then coordinate the results.
10. The agent should run quality checks such as lint, typecheck, and build.
11. Review the result in the browser and iterate.

You do not need a special command for this default workflow. The project instructions already tell the agent how to plan, split implementation work, use sub-agents, and verify the result.

## Starter Prompt

Use this as a first message to your coding agent after installing the starter:

```text
I am using the Agentic Coding Starter Kit. Treat the existing app as boilerplate that should be replaced by the product I describe.

Use the project instructions in AGENTS.md or CLAUDE.md. During planning, ask clarifying questions before making assumptions. During implementation, split the work into small chunks, use sub-agents where useful, follow DESIGN.md for UI, preserve the existing tech stack unless there is a good reason to change it, and run lint, typecheck, and build before finishing.

What I want to build:
[Describe your app here]
```

For example:

```text
What I want to build:
A lightweight CRM for solo consultants. It should let users manage clients, track deals, write notes, set follow-up reminders, and view a simple dashboard of open opportunities.
```

## When to Use Specs

For most POCs and MVPs, the normal agent workflow is enough. Use a spec when the feature is large, long-running, risky, or needs to be split across multiple implementation sessions.

The starter includes two skills for that workflow:

- `create-spec`: turns a planning conversation into `specs/{feature}/` with requirements, task files, dependency waves, and manual action notes.
- `implement-feature`: reads a spec folder and coordinates implementation wave by wave with review gates.

Use this workflow when:

- the feature spans many files or modules
- multiple agents should work in parallel
- the implementation may take more than one session
- you need resumable progress tracking
- you want a written implementation record before coding starts

Example agent request:

```text
Create a spec for the billing and subscriptions feature we just planned. Break it into parallel implementation waves and include any manual setup steps.
```

Then:

```text
Implement the billing and subscriptions spec from specs/billing-subscriptions.
```

## Project Structure

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── forgot-password/
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── api/
│   │   ├── auth/
│   │   ├── chat/
│   │   └── diagnostics/
│   ├── chat/
│   ├── dashboard/
│   ├── profile/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   ├── ui/                  # shadcn/ui primitives (incl. form.tsx)
│   ├── site-footer.tsx
│   └── site-header.tsx
├── emails/                  # React Email templates
├── hooks/
└── lib/
    ├── auth.ts
    ├── auth-client.ts
    ├── db.ts
    ├── env.ts
    ├── mail/                # Resend mailer (console fallback)
    ├── schema.ts
    ├── session.ts
    ├── storage.ts           # S3-compatible storage (local fallback)
    └── utils.ts
```

The repository root also includes a `Dockerfile`, `.dockerignore`, `playwright.config.ts`, and an `e2e/` test folder.

Important root files:

- `AGENTS.md`: coding-agent behavior rules
- `CLAUDE.md`: Claude entrypoint for the same guidance
- `DESIGN.md`: UI design system and component guidance
- `drizzle.config.ts`: Drizzle migration configuration
- `compose.yml`: local PostgreSQL service
- `env.example`: environment variable template
- `components.json`: shadcn/ui configuration

## Available Scripts

```bash
pnpm dev           # Start the development server with Turbopack
pnpm build         # Build for production (no migrations)
pnpm build:ci      # Build for production (alias used in CI)
pnpm start         # Start the production server
pnpm lint          # Run ESLint
pnpm typecheck     # Run TypeScript without emitting files
pnpm check         # Run lint and typecheck
pnpm test:e2e      # Run Playwright end-to-end tests
pnpm format        # Format the repository
pnpm format:check  # Check formatting
pnpm setup         # Run the setup script
pnpm db:generate   # Generate Drizzle migrations
pnpm db:migrate    # Run Drizzle migrations
pnpm db:studio     # Open Drizzle Studio
```

The repository also contains Drizzle push/reset helper scripts for local experimentation. For schema changes you intend to keep, prefer:

```bash
pnpm db:generate
pnpm db:migrate
```

Do not use schema push as a replacement for migrations in real project work.

## Database Workflow

For local development:

```bash
podman compose up -d   # or: docker compose up -d
pnpm db:migrate
```

When your app needs schema changes, ask your agent to update `src/lib/schema.ts`, generate a migration, and run it:

```bash
pnpm db:generate
pnpm db:migrate
```

When deploying, set `POSTGRES_URL` in that environment and run `pnpm db:migrate` as a release step before the new version serves traffic.

## AI Features

AI chat is an **optional module**. The starter uses the Vercel AI SDK with OpenRouter. If you don't need AI, you can remove the `chat` page, the `src/app/api/chat` route, and the `ai`, `@ai-sdk/react`, and `@openrouter/ai-sdk-provider` dependencies. To enable AI chat, set these variables:

```env
OPENROUTER_API_KEY=sk-or-v1-your-key
OPENROUTER_MODEL="openai/gpt-5-mini"
```

OpenRouter lets you switch models without changing the application code. Update `OPENROUTER_MODEL` when you want to try a different model.

## File Storage

The starter includes a storage abstraction (`src/lib/storage.ts`) that uses an **S3-compatible** backend when configured and falls back to local filesystem storage otherwise. It works with Hetzner Object Storage, MinIO, AWS S3, Cloudflare R2, and any other S3-compatible provider. It also exposes `getUploadUrl` / `getDownloadUrl` helpers for pre-signed URLs.

For local development, leave the `S3_*` variables empty. Files are stored under `public/uploads/`.

To use a remote bucket, set:

- `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
- `S3_REGION` (use `auto` for many providers)
- `S3_ENDPOINT` (leave empty for AWS S3; set it for Hetzner/MinIO/R2)
- `S3_PUBLIC_URL` (optional public/CDN base URL for object access)

The app chooses the storage backend based on whether the S3 credentials are configured.

## Deployment

The app builds to a standalone server (`output: "standalone"`) and ships a `Dockerfile`, so it runs on any Docker- or Podman-compatible host — **Coolify**, Hetzner, Fly, or a plain VPS.

```bash
docker build -t my-app .
docker run -p 3000:3000 --env-file .env my-app
```

The same `Dockerfile` builds and runs unchanged with Podman:

```bash
podman build -t my-app .
podman run -p 3000:3000 --env-file .env my-app
```

Set the required production environment variables:

- `POSTGRES_URL`
- `BETTER_AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY` and `EMAIL_FROM`, to send real emails
- `S3_*`, if using remote file storage
- `OPENROUTER_API_KEY` and `OPENROUTER_MODEL`, if using AI features

Database migrations are **not** run during the build (a container build has no database access). Run them as a separate release/pre-deploy step:

```bash
pnpm db:migrate
```

On Coolify, configure this as a pre-deploy command; in CI, run it behind a manual approval gate before deploying. The `.github/workflows/ci.yml` file includes a commented-out Coolify webhook deploy job you can enable.

## Testing

End-to-end tests live in `e2e/` and run with Playwright against your local
database (the `POSTGRES_URL` from `.env`). Make sure the database is running and
migrated first:

```bash
pnpm exec playwright install   # one-time: download browsers
podman compose up -d           # or: docker compose up -d
pnpm db:migrate
pnpm test:e2e
```

Playwright starts the dev server automatically for local runs. The suite
includes a real register → sign-out → sign-in flow (using a unique email per
run) alongside the static smoke tests. In CI, a PostgreSQL service is
provisioned, migrations are applied, and the suite runs after the build (see
`.github/workflows/ci.yml`).

## Troubleshooting

### The app cannot connect to Postgres

Confirm Docker (or Podman) is running and start the database:

```bash
podman compose up -d   # or: docker compose up -d
```

Then check that `POSTGRES_URL` in `.env` matches the database connection string.

### Auth reset or verification emails are not arriving

In development, links are logged to the terminal. This is intentional. Connect an email provider before using password reset or verification in production.

### AI chat is not working

Set `OPENROUTER_API_KEY` and restart the dev server. Also confirm `OPENROUTER_MODEL` is a model available to your OpenRouter account.

### My agent is preserving too much boilerplate

Tell the agent directly that the starter UI is scaffolding and should be replaced:

```text
Replace the starter UI with the actual product UI. Do not keep setup checklists, placeholder navigation, demo content, or boilerplate copy unless I explicitly ask for it.
```

### I need Google login

Ask your agent to add Google OAuth through Better Auth while keeping email/password enabled. You will need Google OAuth credentials and production callback URLs.

## Video Tutorial

Watch the original walkthrough:

[Agentic Coding Boilerplate Tutorial](https://youtu.be/zVZotTk6ZWU)

Some details in older videos may differ from the current starter. This README is the source of truth for the current default workflow.

## Support This Project

If this starter kit helped you build something useful, you can support the project here:

[Buy me a coffee](https://www.buymeacoffee.com/leonvanzyl)

## Contributing

1. Fork this repository.
2. Create a feature branch.
3. Make your changes.
4. Run the relevant checks.
5. Open a pull request.

## License

This project is licensed under the MIT License.

## Need Help?

- Check the repository issues: [github.com/stefanowitschdev/agentic-coding-starter-kit-web/issues](https://github.com/stefanowitschdev/agentic-coding-starter-kit-web/issues)
- Review `AGENTS.md`, `CLAUDE.md`, and `DESIGN.md`
- Open a new issue with the exact setup steps, error output, and environment details
