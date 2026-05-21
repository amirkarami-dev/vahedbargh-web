# CI/CD Pipeline

---

## Current Pipeline (manual)

```
local: git push → GitHub → manual: scripts/deploy.ps1
```

## Target Pipeline (GitHub Actions)

```
push to dev → CI (lint + typecheck + build) → staging deploy
PR dev→main → CI + review
push to main → CI + production deploy
```

---

## GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npx tsc --noEmit
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build:prod
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_DATA_PROVIDER: supabase

  deploy-staging:
    needs: ci
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/dev'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to staging
        run: |
          # Package + SCP + SSH (same as deploy.ps1 logic)
          # ... staging server config

  deploy-production:
    needs: ci
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to production
        env:
          SSH_KEY: ${{ secrets.DEPLOY_SSH_KEY }}
          SERVER_IP: ${{ secrets.SERVER_IP }}
        run: |
          echo "$SSH_KEY" > /tmp/deploy_key
          chmod 600 /tmp/deploy_key
          npm ci && npm run build:prod
          # Package artifacts
          # SCP + SSH deploy
```

---

## Supabase Migrations in CI

```yaml
  migrate:
    needs: ci
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
        with:
          version: latest
      - name: Run migrations
        run: supabase db push --db-url ${{ secrets.DATABASE_URL }}
```

---

## Required GitHub Secrets

```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL            # postgres://... direct connection URL
DEPLOY_SSH_KEY          # RSA private key for server SSH
SERVER_IP               # Production server IP
SENTRY_AUTH_TOKEN
```

---

## Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "build:prod": "next build",
    "start": "node .next/standalone/server.js",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "db:generate": "supabase gen types typescript --local > src/types/database.ts",
    "db:migrate": "supabase db push",
    "db:reset": "supabase db reset",
    "deploy": "powershell -ExecutionPolicy Bypass -File scripts/deploy.ps1"
  }
}
```
