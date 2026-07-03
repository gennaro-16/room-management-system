# Branding & Open-Source Release

## Why the brand was changed

This project was originally developed for a specific client organization with custom branding (logos, colors, copy, and UI labels). To publish it as an open-source portfolio project, the client-specific identity was removed and replaced with a neutral **Room Booking System** brand.

Changes in the public `main` branch include:

- Generic product name and page titles
- Neutral logo (`public/logo.svg`) instead of client logos
- CSS design tokens renamed from client-specific names to `brand-*`
- Documentation updated to remove client references
- Folder names standardized (`room-management-backend-nest`, `room-management-frontend-next`)

## Original branded version

The pre-open-source codebase with the original client branding is preserved on:

**Branch:** [`branded-client-version`](https://github.com/gennaro-16/room-management-system/tree/branded-client-version)

That branch reflects the state of the repository before the open-source preparation work. It is kept for historical reference and demonstration of the original delivery — not for redistribution or public hosting without client permission.

## Which branch should you use?

| Branch | Purpose |
|--------|---------|
| `main` | Public open-source release — use this to clone, contribute, and deploy |
| `branded-client-version` | Archived reference of the original client-branded application |
