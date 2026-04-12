## Planning mode

Never make assumptions about what the user wants. Always ask clarifying questions before proceeding.

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
