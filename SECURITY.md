# Security Policy

## Reporting a vulnerability

If you discover a security issue, please **do not** open a public GitHub issue with exploit details.

Instead, contact the maintainer privately (GitHub profile / portfolio contact). Include:

- Description of the issue
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Secrets & credentials

- **Never commit** `.env` files, API keys, database passwords, or JWT secrets
- Use [`.env.example`](./.env.example) as a template only
- Rotate any credential that was ever committed to git — even if later removed from `main`

### Historical note

Earlier commits in this repository (and branches like `branded-client-version`) may contain committed environment files. If you forked or cloned before the open-source cleanup:

1. Assume those credentials are compromised
2. Rotate database passwords and JWT secrets immediately
3. Use only the current `main` branch setup with `.env.example`

## Safe defaults for local development

- Seed users use fictional emails and `password123` — change before any real deployment
- Docker Compose defaults use placeholder passwords — always override in `.env`
- Do not expose the API publicly without HTTPS, strong `JWT_SECRET`, and rate limiting

## Supported versions

| Version | Supported |
|---------|-----------|
| `main` (latest) | Yes |
| `branded-client-version` | Archive only — not maintained |
