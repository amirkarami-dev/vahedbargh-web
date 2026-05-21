# Deploy Runbook

---

## Normal Deploy (PowerShell, local)

```powershell
# From project root:
.\scripts\deploy.ps1
```

This:
1. Runs `npm run build:prod`
2. Packages `.next/standalone`, `.next/static`, `public/`, `.env.production` into `deploy.zip`
3. SCPs the zip to `ubuntu@185.206.94.116:/opt/vahedbargh-web`
4. SSH: unzips, runs `docker compose up --build -d`

**Expected duration**: 3–5 minutes  
**Rollback**: See rollback section below

---

## Verify Deploy

```bash
# Check container is running
ssh ubuntu@185.206.94.116 "cd /opt/vahedbargh-web && docker compose ps"

# Check logs for errors
ssh ubuntu@185.206.94.116 "cd /opt/vahedbargh-web && docker compose logs --tail=50 vahedbargh-web"

# Check app responds
curl -I https://demo.kurdnezambargh.ir/admin/login
```

---

## Rollback

```bash
# List recent Docker images
ssh ubuntu@185.206.94.116 "docker images vahedbargh-web-vahedbargh-web"

# Roll back to previous image
ssh ubuntu@185.206.94.116 "
  cd /opt/vahedbargh-web
  docker compose down
  docker tag vahedbargh-web-vahedbargh-web:<old-tag> vahedbargh-web-vahedbargh-web:latest
  docker compose up -d
"
```

---

## Database Migration Deploy

```bash
# Run Supabase migrations
npx supabase db push --db-url "postgresql://postgres:<password>@db.supabase.kurdnezambargh.ir:5432/postgres"

# Or via Supabase CLI with linked project
npx supabase link --project-ref <ref>
npx supabase db push
```

---

## Environment Variables (Production)

Located at `/opt/vahedbargh-web/.env.local` on the server.  
Update and restart:

```bash
ssh ubuntu@185.206.94.116 "
  nano /opt/vahedbargh-web/.env.local
  # edit vars
  cd /opt/vahedbargh-web && docker compose up -d --build
"
```

---

## Health Checks

```bash
# App
curl https://demo.kurdnezambargh.ir/api/health

# Supabase
curl https://supabase.kurdnezambargh.ir/rest/v1/ -H "apikey: <anon-key>"

# Container memory/CPU
ssh ubuntu@185.206.94.116 "docker stats --no-stream"
```
