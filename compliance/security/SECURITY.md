# Security Policy

---

## Authentication Security

- Supabase Auth with `httpOnly` cookie sessions (not `localStorage`)
- Middleware enforces auth on all `/admin/*` routes
- Custom JWT claims: `cid` (client_id), `roles[]`
- SMS OTP for 2FA (via msgway.com, server-side only)
- Session expiry: 1 hour access token, 7-day refresh token
- Force-reset all migrated users on first login

## Row Level Security (RLS)

**Every table** must have RLS enabled and policies that enforce multi-tenancy.

### Pattern A: Tenant-scoped read/write

```sql
-- Enable RLS
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own tenant's data
CREATE POLICY "<table>_tenant_access"
  ON <table>
  USING (client_id = (auth.jwt() ->> 'cid')::uuid);
```

### Pattern B: Role-gated write

```sql
CREATE POLICY "only_admin_can_delete"
  ON elect_projects FOR DELETE
  USING (
    (auth.jwt() ->> 'cid')::uuid = client_id
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role IN ('Administrator', 'SuperUser', 'Section')
        AND client_id = (auth.jwt() ->> 'cid')::uuid
    )
  );
```

### Pattern C: Owner-only

```sql
CREATE POLICY "engineer_own_processes"
  ON elect_project_processes FOR UPDATE
  USING (
    (auth.jwt() ->> 'cid')::uuid = client_id
    AND EXISTS (
      SELECT 1 FROM engineers
      WHERE id = elect_project_processes.engineer_id
        AND user_id = auth.uid()
    )
  );
```

### RLS Checklist

| Table | RLS | Tenant | Role-gated |
|---|---|---|---|
| `profiles` | ✅ | per user | Admin sees all in tenant |
| `user_roles` | 🔲 | per client | Admin only |
| `clients` | 🔲 | per client | SuperUser only |
| `elect_projects` | 🔲 | per client | Delete: Admin/Section |
| `elect_project_processes` | 🔲 | per client | Update: Engineer (own) |
| `elect_project_files` | 🔲 | per client | — |
| `engineers` | 🔲 | per client | Write: Admin/Accountant/Section |
| `transactions` | 🔲 | per client | Write: Accountant/Admin |
| `invoices` | 🔲 | per client | — |
| `supports` | 🔲 | per client + user_id/to_user_id | Close: Admin/Employee |
| `notifications` | 🔲 | per user | — |
| `audit_logs` | 🔲 | per client | Admin read-only |
| `site_settings` | 🔲 | global (no RLS) | Admin only via service role |

---

## Secrets Management

- All secrets in `.env.local` (never committed)
- Docker Compose passes secrets via `environment:` or `secrets:`
- Supabase service role key only used server-side (never in `NEXT_PUBLIC_*` vars)
- Edge Function secrets in `supabase/functions/.env` (not the repo)
- Rotate API keys on any suspected exposure

### Required Secrets

```
SUPABASE_SERVICE_ROLE_KEY    # Server-side only
MSGWAY_API_KEY               # Server-side only
BMI_TERMINAL_ID              # Server-side only
BMI_RSA_PUBLIC_KEY           # Server-side only
BALE_API_KEY                 # Edge Function only
METABASE_SECRET_KEY          # Server-side only
ELECTCO_AUTH_TOKEN           # Server-side only
RESEND_API_KEY               # Edge Function only
```

---

## Input Validation

- All form inputs validated with **Zod** on the server (in Server Actions)
- File upload: validate MIME type + max size server-side before saving to Storage
- SQL injection: not applicable (Supabase JS client uses parameterized queries)
- XSS: Next.js escapes by default; no `dangerouslySetInnerHTML` without sanitization
- CSRF: Server Actions use SameSite cookies + Next.js built-in CSRF protection

---

## File Upload Security

```typescript
// src/lib/storage.ts
const ALLOWED_MIME_TYPES = [
  "image/jpeg", "image/png", "image/webp",
  "application/pdf",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;  // 10 MB

export function validateFile(file: File) {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("نوع فایل مجاز نیست");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("حجم فایل بیش از حد مجاز است");
  }
}
```

---

## API Route Security

- Public API routes (payment callbacks): validate IranKish signature, not just token presence
- Admin API routes: always verify Supabase session server-side
- Rate limiting: Next.js middleware or edge rate limiter on `/api/payment/*` and `/api/sms/*`

---

## Audit Logging

```sql
-- Trigger-based audit on critical tables
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (client_id, user_id, action, entity, entity_id, old_values, new_values)
  VALUES (
    COALESCE(NEW.client_id, OLD.client_id),
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN row_to_json(OLD)::jsonb END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN row_to_json(NEW)::jsonb END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to critical tables:
CREATE TRIGGER audit_elect_projects AFTER INSERT OR UPDATE OR DELETE ON elect_projects
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_transactions AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```
