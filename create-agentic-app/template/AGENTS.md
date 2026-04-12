## Planning mode

Never make assumptions about what the user wants. Always ask clarifying questions before proceeding.

# MANDATORY: Feature Planning & Implementation Workflow

**This workflow is non-negotiable for any non-trivial feature or multi-step change.** Do not implement multi-task features directly in a single session. Do not write a monolithic plan and start coding from it. The workflow below exists because implementation plans that live in a single file are either too large for a context window or too shallow for independent execution — both lead to poor results.

### The workflow has three stages. Execute them in order, every time.

**Stage 1 — Plan.** Discuss the feature with the user. Ask clarifying questions. Understand requirements, technical constraints, and acceptance criteria. This happens naturally in planning mode.

**Stage 2 — Create the spec.** Once planning is complete, invoke the `create-spec` skill. This converts the planning conversation into a structured `specs/{feature}/` folder with:
- Self-contained task files (one per task, in a `tasks/` subfolder)
- A README with a dependency graph and parallel execution waves
- Requirements and manual action items

Do not skip this step. Do not proceed to implementation without a spec folder. The spec is what enables parallel agent execution — without it, you're back to single-threaded implementation.

**Stage 3 — Implement via orchestration.** Once the spec folder exists and the user approves it, invoke the `implement-feature` skill. This orchestrates parallel coder agents wave-by-wave:
- Each task is dispatched to its own coder agent
- Tasks within a wave run in parallel
- A code review gate runs between waves
- Issues from review are dispatched back to coder agents
- The cycle repeats until everything passes

The main agent (you) does NOT write code during Stage 3. You orchestrate. Coder subagents implement. The code-review agent verifies. You manage progress and commit completed waves.

### When does this workflow apply?

- Any feature with 2+ tasks or files to change
- Any work that came out of a planning conversation
- Any time the user says "implement", "build", "create this feature", or similar after discussing what to build

### When does it NOT apply?

- Single-file bug fixes or trivial changes
- Quick config edits or one-line patches
- Tasks the user explicitly asks to do inline ("just fix this here")

If in doubt, ask the user: "This looks like it could benefit from a spec — should I create one, or would you prefer I implement it directly?"

---

# Project Agent Instructions

## Skills

This repo ships agent skills under `.claude/skills` (mirrored at `.agents/skills`). **Read and follow the relevant skill** when your task matches its domain—skills encode stack conventions and patterns for this project.

Use **`find-skills`** when you are unsure whether a skill exists for a task or want to discover installable skills from registries.

## Pre-flight (non-trivial tasks)

1. Map the work to skills using the routing table below.
2. Open and follow matching skills before writing substantial code or making architectural decisions.

If you start down the wrong path, stop, invoke the right skill, and continue from there.

## Task → skill routing

| If you are about to… | Invoke first |
| --- | --- |
| Plan a feature, create a spec, break work into tasks | `create-spec` |
| Implement a planned feature, execute a spec | `implement-feature` |
| Create a checkpoint commit | `checkpoint` |
| Review a pull request | `review-pr` |
| Touch Next.js App Router, routing, RSC, data fetching, deployment | `nextjs` |
| Touch shadcn/ui components or registries | `shadcn` |
| Touch Better Auth configuration or auth flows | `better-auth-best-practices` |
| Optimize or review React / Next.js performance | `vercel-react-best-practices` |
| Build, modify, or review an MCP server | `mcp-builder` |
| Build or review a frontend design / UI | `frontend-design`, `web-design-guidelines` |
| Automate browser testing (Playwright) | `playwright-cli` |
| Create or refine project agent skills | `skill-creator` |
| Look for a skill or extend capabilities | `find-skills` |

Stack skills compose: invoking `nextjs` does not excuse skipping `shadcn` or `better-auth-best-practices` when those layers are involved.

## Hard rules

1. **Never touch the Next.js / shadcn / Better Auth / MCP layers without reading their corresponding skill** for this repo. They are mandatory references, not optional browsing.
2. **Before claiming work is done, fixed, or passing**, run the project’s verification commands (see workspace rules: lint and typecheck scripts) and only assert success when the output supports it.

## If no skill matches

Fall back to sound engineering judgment. State explicitly: _"I checked the skills list and none applied because …"_ so the user can correct a missed skill.
