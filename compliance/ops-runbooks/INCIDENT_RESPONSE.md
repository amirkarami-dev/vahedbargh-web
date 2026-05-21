# Incident Response Runbook

---

## Severity Levels

| Level | Criteria | Response Time |
|---|---|---|
| P1 — Critical | Production down, payment broken, data loss | Immediate |
| P2 — High | Major feature broken, many users affected | < 2 hours |
| P3 — Medium | Feature partially broken, workaround available | < 24 hours |
| P4 — Low | Minor bug, cosmetic, single user affected | Next sprint |

---

## P1: Production Down

```
1. Check container status:
   ssh ubuntu@185.206.94.116 "docker compose ps && docker compose logs --tail=100"

2. Check Supabase:
   https://supabase.kurdnezambargh.ir/dashboard

3. If container crashed → restart:
   ssh ubuntu@185.206.94.116 "cd /opt/vahedbargh-web && docker compose restart"

4. If code bug → rollback (see DEPLOY.md)

5. Notify users via Bale bot or SMS

6. Create incident post-mortem after resolution
```

---

## P1: Payment Gateway Down

```
1. Check IranKish status: https://ikc.shaparak.ir
2. Check payment return route /api/payment/return logs
3. If IranKish down → show maintenance banner on payment pages
4. Manually reconcile any pending bank_transactions after recovery
5. Contact IranKish support: <contact details>
```

---

## P2: Supabase Realtime Not Working

```
1. Check Realtime service in Supabase dashboard
2. Check browser console for WebSocket errors
3. Fallback: disable realtime, use polling (query every 30s)
```

---

## Data Recovery

```bash
# Restore from Supabase backup (daily backups enabled)
# In Supabase dashboard: Settings > Backups > Restore

# Manual backup before risky operations:
pg_dump "postgresql://postgres:<password>@db.supabase.kurdnezambargh.ir:5432/postgres" \
  --format=custom \
  --file="backup-$(date +%Y%m%d).dump"
```

---

## Monitoring Checklist

- [ ] Sentry alerts configured for error rate > 5%
- [ ] Server disk space alert > 80%
- [ ] Container memory alert > 80%
- [ ] Supabase database size monitoring
- [ ] pg_cron job failure alert (check `cron.job_run_details`)
