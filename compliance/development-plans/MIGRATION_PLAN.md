# Master Migration Plan
## vahedbargh-api-9 + vahedbargh-ui → vahedbargh-web

> Version 1.0 — 2026-05-21  
> Owner: Engineering Team

---

## 1. Goals

1. Replace the .NET 9 + React 17 stack with a unified Next.js 16 + Supabase application
2. Preserve 100% of existing business logic and workflows
3. Migrate all SQL Server data to Supabase PostgreSQL
4. Migrate all Liara S3 files to Supabase Storage
5. Introduce shadcn/ui design system (dark/light + user-customisable theme colour)
6. Make the application fully responsive (mobile-first)
7. Keep the Jalali/Persian calendar experience identical to the old system
8. Replace all synchronous background processing with pg_cron + Edge Functions
9. Maintain multi-tenancy via Supabase RLS

---

## 2. Migration Phases

### Phase 0 — Foundation (current state + scaffolding) ✅ partial
- [x] Next.js 16 App Router project bootstrapped
- [x] Supabase self-hosted running at `https://supabase.kurdnezambargh.ir`
- [x] Docker deploy pipeline working (`scripts/deploy.ps1`)
- [x] Admin shell (sidebar, login, settings, stats CRUD)
- [x] Mock service layer with Supabase toggle via `NEXT_PUBLIC_DATA_PROVIDER`
- [ ] shadcn/ui installed and theme configured
- [ ] Supabase Auth wired up (replace mock auth)
- [ ] compliance/ folder and planning docs (this document)

### Phase 1 — Auth & User Management
See [modules/AUTH.md](../modules/AUTH.md)

- Replace mock admin login with Supabase Auth (email+password)
- Implement SMS OTP (phone MFA) via msgway.com + Supabase custom SMTP/phone
- Migrate `ApplicationUser` + Identity roles to `profiles` + `user_roles` tables
- JWT claims: add `client_id`, `role`, `subdomain` as custom claims
- Implement route guards per role (replaces `Authmiddleware.js`)
- Migrate existing users (see Database Migration section)

### Phase 2 — Database Migration (SQL Server → PostgreSQL)
See [backend/DATABASE_SCHEMA.md](../backend/DATABASE_SCHEMA.md)

- Export SQL Server schema via `sqlacodegen` or manual EF scaffold
- Convert to PostgreSQL DDL (naming: PascalCase → snake_case, Guid → uuid, DateTime → timestamptz)
- Write RLS policies for every table (enforcing `client_id = auth.jwt() ->> 'cid'`)
- Create Supabase migrations in `supabase/migrations/`
- Data-export pipeline: SQL Server → CSV → Supabase `COPY` (or pg_dump over linked server)
- Validate row counts and spot-check FK integrity

### Phase 3 — File Storage Migration
See [backend/INTEGRATIONS.md](../backend/INTEGRATIONS.md)

- Create Supabase Storage buckets: `project-files`, `user-files`, `support-files`, `signatures`, `reports`, `templates`
- Write migration script: iterate Liara S3 keys → download → re-upload to Supabase Storage
- Update all file-path references in migrated DB rows to Supabase Storage paths
- Implement signed-URL access via Supabase Storage API (replacing `GET /Users/GetPhysicalFileS3`)

### Phase 4 — Core Module Implementation

Implement each module as Next.js pages + Server Actions + Supabase queries.  
Order determined by dependency graph:

1. **Engineers** (no upstream deps, needed by Projects)
2. **Projects** (core module — ElectProject entity + lifecycle)
3. **Project Processes** (EPP — depends on Projects + Engineers)
4. **Accounting** (depends on Projects + Engineers)
5. **Quotas** (depends on Engineers + Quarter Tariffs)
6. **Support/Tickets** (independent of above)
7. **Reports** (depends on all data)

### Phase 5 — Background Jobs
See [backend/BACKGROUND_JOBS.md](../backend/BACKGROUND_JOBS.md)

- `AutoOutProcessBackgroundService` → `pg_cron` job `auto_cancel_overdue_processes()`
- `BalePollingService` → Supabase Edge Function with Bale webhook
- SMS queue → Edge Function triggered via Supabase Database Webhook
- PDF report generation → Edge Function using Puppeteer (or external service)

### Phase 6 — Realtime & Notifications
- Replace SignalR hub `/frontnotif` with Supabase Realtime channel per `client_id`
- Replace `@microsoft/signalr` in frontend with `@supabase/supabase-js` realtime subscriptions
- Notification badge / unread count updates via realtime

### Phase 7 — External Integrations
See [backend/INTEGRATIONS.md](../backend/INTEGRATIONS.md)

- IranKish/Shaparak payment: port RSA tokenization logic to Next.js API route
- msgway.com SMS: Edge Function wrapper (keep same API contract)
- Bale Messenger bot: Edge Function (replaces `BalePollingService`)
- Metabase embedded dashboards: Next.js API route generating signed JWT
- nezam.nigc-kd.ir (ElectCo): Server Action proxy
- Email (SMTP): Edge Function using Resend or keep SMTP via nodemailer

### Phase 8 — Reports & PDF
- Map Stimulsoft `.mrt` templates → HTML/CSS equivalents
- Use `puppeteer-core` in Edge Function or Vercel OG for PDF generation
- iTextSharp signature overlay → `pdf-lib` + Canvas in Node.js
- Store generated PDFs in Supabase Storage `reports/` bucket

### Phase 9 — Polish & Cutover
- Full responsive audit (mobile-first, test on 375px, 768px, 1280px)
- Dark/light theme + colour picker wired to `shadcn/ui` CSS variables
- Jalali date input on every date field (react-multi-date-picker)
- i18n: Persian + English translations via `next-intl`
- SEO metadata for public pages
- Sentry Next.js SDK
- Load testing
- Parallel run (old system + new system) with data sync
- DNS cutover

---

## 3. Data Migration Strategy

### 3.1 User Migration

The old system has two user stores:
- **ASP.NET Identity** `AspNetUsers` (auth) ← maps to `auth.users` (Supabase)
- **Domain entities**: `Engineer`, `Executor`, `PanelMaker` ← maps to their own tables

**Decision**: Use Supabase Auth for auth. Create a `profiles` table linked to `auth.users.id`.

```
AspNetUsers → auth.users (email, phone) + profiles (name, national_code, client_id, role, etc.)
Engineer → engineers table (linked by user_id)
Executor → executors table
PanelMaker → panel_makers table
```

**Password migration**: Supabase Auth does not accept bcrypt hashes from ASP.NET Identity directly.  
Options:
1. Force password reset on first login (recommended — most secure)
2. Export hashes + store in `profiles.legacy_hash`; on first login verify old hash, then set new Supabase password

**Recommendation**: Option 1 (force reset). Send users SMS with reset link.

### 3.2 Business Data Migration

```
SQL Server table         → PostgreSQL table
─────────────────────────────────────────────
Clients                  → clients
ClientSettings           → client_settings
ClientAreas              → client_areas
ClientAreaPoints         → client_area_points
ElectProjects            → elect_projects
ElectProjectProcesses    → elect_project_processes
ElectProjectFiles        → elect_project_files
ElectProjectErtForms     → elect_project_ert_forms
CommentEngForms          → comment_eng_forms
CheckListForms           → check_list_forms
CheckListEdcs            → check_list_edcs
Engineers                → engineers
EngineerHistories        → engineer_histories
Executors                → executors
PanelMakers              → panel_makers
Transactions             → transactions
Invoices                 → invoices
BankTransactions         → bank_transactions
EngPaymentLists          → eng_payment_lists
EngPaymentTasks          → eng_payment_tasks
EngQuotaBurns            → eng_quota_burns
QuarterTariffs           → quarter_tariffs
BuildingTariffs          → building_tariffs
ErtTariffs               → ert_tariffs
Provinces                → provinces  (seed data)
Cities                   → cities     (seed data)
Sections                 → sections   (seed data)
Supports                 → supports
SupportMessages          → support_messages
SupportFiles             → support_files
UserFiles                → user_files
Routes                   → routes
```

Audit logs (PostgreSQL source): copy `ElecAuditLog` → `audit_logs` (already PostgreSQL, easy COPY).

### 3.3 Migration Script Order (FK dependencies)

```
1. provinces, cities, sections   (lookup/seed)
2. clients                       (tenant root)
3. profiles / auth.users         (users)
4. client_settings, client_areas, client_area_points
5. building_tariffs, ert_tariffs, quarter_tariffs
6. engineers, engineer_histories
7. executors, panel_makers
8. elect_projects
9. elect_project_processes
10. elect_project_files, elect_project_ert_forms,
    comment_eng_forms, check_list_forms, check_list_edcs
11. transactions, bank_transactions
12. invoices
13. eng_payment_tasks, eng_payment_lists
14. eng_quota_burns
15. user_files
16. supports, support_messages, support_files
17. routes
```

---

## 4. Architecture Decisions

### 4.1 Multi-tenancy

Every table has a `client_id uuid NOT NULL` column.  
RLS policy on every table: `USING (client_id = (auth.jwt() ->> 'cid')::uuid)`.  
Service-role key bypasses RLS (used only in Edge Functions and migration scripts).

### 4.2 State Management (Frontend)

Replace Redux-Saga (20 slices) with:
- **TanStack Query v5** for all server data (replaces 95% of sagas)
- **Zustand** for UI-only state (sidebar collapse, modal open/close, theme selection)
- **React Hook Form** for all forms (replaces redux-form + formik)

### 4.3 Persian/Jalali Calendar

Keep `react-multi-date-picker` + `react-date-object`.  
Use `jalaali-js` for server-side conversions (Solar ↔ Gregorian).  
Store all dates as `timestamptz` (UTC) in PostgreSQL; display as Jalali in UI.  
Preserve `solar_*` string columns for legacy report compatibility.

### 4.4 shadcn/ui + Theme

- Install shadcn/ui with CSS variables
- Add `ThemeProvider` with colour-picker (`--primary` HSL variable)
- User theme preference stored in `localStorage` + `profiles.theme_color`
- Full dark/light toggle (already partially in place in globals.css)

### 4.5 PDF Reports

Stimulsoft is commercial and .NET-only. Replace with:
1. **HTML templates** rendered server-side → converted to PDF via `@sparticuz/chromium` + puppeteer in Edge Function
2. Store template HTML in `src/lib/reports/templates/`
3. Signature image overlay via `pdf-lib`

Reports to migrate:
- `ApprovedCommentEngForm` — engineer inspection comment report
- `ApprovedCheckListEngForm` — engineer checklist report
- `ApprovedErtForm` — ERT electrode measurement report
- `ApprovedSentToElectForm` — project submission to electricity company form
- Big-project variants (multi-engineer)

### 4.6 Payment Gateway (IranKish)

The RSA tokenization and bank callback logic must be ported to a Next.js API route (`/api/payment/`).  
Keep the same `BMIMerchant.*` config keys in `.env.local`.  
The callback route (`PaymentMelliReturn`) must be publicly accessible (no auth) — use `export const runtime = 'nodejs'` for RSA operations.

---

## 5. Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| Password migration breaks user logins | High | Force-reset SMS + grace period on old system |
| Stimulsoft .mrt templates complex to recreate | High | Start with HTML approximations, iterate |
| IranKish RSA porting bugs cause payment failures | Critical | Test in sandbox with all edge cases; keep old system live until verified |
| pg_cron not running auto-cancel | Medium | Add alerting on overdue processes; test in staging |
| Bale bot polling gap during migration | Low | Run old .NET service in parallel until bot Edge Function proven |
| Geospatial data (NetTopologySuite points) | Medium | PostGIS extension in Supabase; import as `geography(Point)` |
| File migration completeness | High | Row-count + spot-check script before cutover |
| Multi-tenant RLS bypass | Critical | Security audit all RLS policies; pen-test |
| Solar date arithmetic edge cases | Medium | Unit-test all conversion functions with known values |

---

## 6. Definition of Done (per module)

Each module is "done" when:
- [ ] All old API endpoints have a Next.js equivalent (Server Action or API Route)
- [ ] All data shapes match (TypeScript interfaces cover all fields)
- [ ] Supabase migration file for the tables exists in `supabase/migrations/`
- [ ] RLS policies tested (user can't see other tenant's data)
- [ ] shadcn/ui components used; no raw Ant Design or MUI imports
- [ ] Jalali dates shown on all date fields
- [ ] Responsive at 375px, 768px, 1280px
- [ ] Loading states, error states, empty states all handled
- [ ] TypeScript strict mode: 0 errors

---

## 7. Team Conventions

- Branch strategy: `feature/<module>` → `dev` → `main`
- Every PR: run `npm run build` locally before pushing
- Supabase migrations: `supabase migration new <name>` → commit the SQL file
- Env vars: never commit `.env.local`; update `.env.example` for every new key
- API types: auto-generate from Supabase `supabase gen types typescript` after schema changes
- Commit prefix: `feat:`, `fix:`, `db:`, `chore:`, `docs:`
