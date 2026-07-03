# Contributing

Thanks for your interest in this project! This repo is open for learning, portfolio review, and contributions.

## Getting started

1. Fork the repository
2. Clone your fork and create a branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Follow the [README quick start](./README.md#quick-start-local-development) to run backend + frontend locally
4. Make your changes
5. Run checks before opening a PR:
   ```bash
   # Backend
   cd room-management-backend-nest
   npm run lint && npm test && npm run build

   # Frontend
   cd room-management-frontend-next
   npm run lint && npm run build
   ```

## Code style

- **Backend:** ESLint + Prettier (run `npm run lint` / `npm run format`)
- **Frontend:** Next.js ESLint (`next/core-web-vitals`)
- Match existing patterns — don't refactor unrelated code in the same PR
- No `console.log` in production paths; use proper error handling instead

## Commits & PRs

- Use clear commit messages (`feat:`, `fix:`, `docs:`, `chore:`)
- One logical change per PR when possible
- Describe what changed and how to test it
- Link related issues if any

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Public open-source release (neutral branding) |
| `branded-client-version` | Archived client-branded snapshot — reference only, do not merge into `main` |

## Questions?

Open a GitHub issue for bugs, feature ideas, or setup help.
