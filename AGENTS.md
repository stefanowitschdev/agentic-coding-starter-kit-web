# CRITICAL RULES - MUST FOLLOW

## RESPONSES

- Keep responses concise and to the point - unless the user asks otherwise

## PLANNING MODE

- Always ask clarifying questions
- Never assume design, tech stack or features
- Use deep-dive sub-agents to assist with research
- Use deep-dive sub-agents to review the different aspects of your plan before presenting to the user

## CHANGE / EDIT MODE

- Never implement features yourself when possible - use sub-agents!
- Identify changes from the plan that can be implemented in parallel, and use sub-agents to implement the features efficiently
- When using sub-agents to implement features, act as a coordinator only
- Use the best model for the task - premium models for complex tasks (like coding) and mid-tier models for simpler tasks, like documentation
- After completing features (large or small), always run commands like lint, type check and next build to check code quality

## DATABASE SCHEMA CHANGES

- Whenever you make changes to the database schema, ALWAYS run the drizzle generate and migrate commands
- NEVER run drizzle push!
- For all ID columns NOT related to BetterAuth, use UUID for the ID columns and be randomly generated

## TESTING

- Use any testing tools, libraries available to the project for testing your changes
- Never assume your changes simply work, always test!
- This project uses **Playwright** for end-to-end tests in `e2e/`. Run them with `pnpm test:e2e`. Add a test for new user-facing flows.
- If the project does not have any testing tools, scripts, MCP tools, skills, etc. available for testing, ask the user whether testing should be skipped.

## STACK

- **Framework:** Next.js (App Router) + React 19 + TypeScript
- **Auth:** Better Auth (email/password; Drizzle adapter)
- **DB/ORM:** PostgreSQL + Drizzle ORM (postgres-js driver)
- **Email:** Resend + React Email via `src/lib/mail` (console fallback without `RESEND_API_KEY`)
- **Storage:** S3-compatible via `src/lib/storage.ts` (local filesystem fallback)
- **Forms:** React Hook Form + Zod with the shadcn `form` component
- **AI (optional):** Vercel AI SDK + OpenRouter
- Keep these provider integrations generic — do not hard-code project-specific business logic into the storage, mail, or auth libraries.

## DEPLOYMENT

- The app builds to a standalone server (`output: "standalone"`) with a `Dockerfile`; it targets any Docker host (Coolify, Hetzner, VPS).
- Do **not** run database migrations during the build. `pnpm build` is `next build` only. Run `pnpm db:migrate` as a separate release/pre-deploy step.

## UI DESIGN

- Always follow the UI design system when creating or reviewing components or pages.
- Design System: @DESIGN.md
