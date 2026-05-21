# Sprint Roadmap
## KURDNEZAM Migration — vahedbargh-web

> 2-week sprints. Each sprint ends with a deployable increment.  
> Updated: 2026-05-21

---

## Sprint 0 — Already Done ✅

| Item | Status |
|---|---|
| Next.js 16 App Router project | ✅ |
| Supabase self-hosted deployment | ✅ |
| Docker deploy pipeline | ✅ |
| Admin shell (sidebar, login page, settings page) | ✅ |
| Mock service layer + Supabase toggle | ✅ |
| Stats admin CRUD | ✅ |
| CSS variables (dark/light theme) | ✅ |
| Logo + branding (KURDNEZAM) | ✅ |
| compliance/ folder created | ✅ |

---

## Sprint 1 — Foundation & Auth

**Goal**: Real authentication, shadcn/ui installed, Supabase schema foundations

### Tasks

- [ ] Install shadcn/ui (`npx shadcn@latest init`)
- [ ] Configure theme: CSS variables + colour picker component
- [ ] Replace custom auth with Supabase Auth (email + password)
- [ ] Add `profiles` table migration + RLS
- [ ] Add `user_roles` table + role claim in JWT
- [ ] Middleware: route guard by role (replaces `Authmiddleware.js`)
- [ ] SMS OTP flow (2FA via msgway.com + Supabase phone token)
- [ ] Admin user management page (list / invite / assign role)
- [ ] `supabase/migrations/` folder + first migration files
- [ ] `supabase gen types typescript` → `src/types/database.ts` auto-generated
- [ ] Update login page to use Supabase Auth client
- [ ] Persian date utility lib (`jalaali-js` wrapper in `src/lib/calendar.ts`)

**Deliverable**: Login with real Supabase auth, role-based dashboard, shadcn/ui design system live

---

## Sprint 2 — Core Schema + Engineers Module

**Goal**: Full PostgreSQL schema created, Engineers module live end-to-end

### Tasks

- [ ] Write all Supabase migrations (all tables from DATABASE_SCHEMA.md)
- [ ] Write all RLS policies (SECURITY.md)
- [ ] Seed: provinces, cities, sections
- [ ] Supabase Storage buckets created
- [ ] Engineers list page (shadcn/ui DataTable, search, filter by section)
- [ ] Engineer create/edit form (all fields incl. certifications)
- [ ] Engineer history sub-table
- [ ] Engineer file uploads (Supabase Storage)
- [ ] Quarter Tariffs admin page
- [ ] Building Tariffs + ERT Tariffs admin pages
- [ ] API types from `supabase gen types` used everywhere

**Deliverable**: Engineers module fully functional with real DB

---

## Sprint 3 — Projects Module (Create & List)

**Goal**: Project creation wizard + admin project list

### Tasks

- [ ] `elect_projects` table + RLS + policies
- [ ] Project creation wizard (multi-step form):
  - Step 1: Owner info (landlord name, national code, phone)
  - Step 2: Building info (type, floors, area, address, geo map)
  - Step 3: Location (province/city/section cascading)
  - Step 4: Electricity details (branching type, ampere, etc.)
  - Step 5: File uploads (IdCard, ElectPlan, etc.)
- [ ] Leaflet map component (location picker)
- [ ] Project list page with full-filter (status, date range, section, search)
- [ ] Project detail view (all fields, timeline, files)
- [ ] File upload to Supabase Storage (`project-files/` bucket)
- [ ] Project status badge (ProjectLevelEnum → colour-coded)
- [ ] Public project info page (`/ep?id=`)

**Deliverable**: Projects can be created, viewed, and listed by admin/section roles

---

## Sprint 4 — Project Processes (EPP) & State Machine

**Goal**: Full project lifecycle (9 stages) with engineer assignment

### Tasks

- [ ] `elect_project_processes` table + RLS
- [ ] Assign engineer to project stage (admin/section UI)
- [ ] Engineer's project queue (ElectProjectProcessEng view)
- [ ] EPP approve/accept/reject actions
- [ ] Stage-specific forms:
  - Expert stage (CommentEngForm)
  - Checklist stage (CheckListForm)
  - ERT form (ElectProjectErtForm — 30+ fields)
  - EDC checklist (CheckListEdc)
- [ ] Stage document upload (expert/map/defect stage files)
- [ ] `auto_cancel_overdue_processes()` pg_cron job
- [ ] Engineer-change action (reassign)
- [ ] Status history timeline component

**Deliverable**: Complete project lifecycle from submission to engineer sign-off

---

## Sprint 5 — Accounting Module

**Goal**: Transactions, invoices, engineer payments

### Tasks

- [ ] `transactions`, `invoices`, `bank_transactions` tables + RLS
- [ ] Payment gateway: IranKish RSA tokenization ported to `/api/payment/` route
- [ ] Payment return callback route (`/api/payment/return`)
- [ ] Manual payment entry (admin/accountant)
- [ ] Transaction list + filter
- [ ] Invoice list (per project, per engineer)
- [ ] Engineer work log (`GetClientEngWork` equivalent)
- [ ] `eng_payment_tasks`, `eng_payment_lists` tables
- [ ] Engineer payment batch management (accountant)
- [ ] Payment deduction calculations (5% + 1% + 7% + 10%)
- [ ] Quota burn management

**Deliverable**: Full accounting module with real payment gateway

---

## Sprint 6 — Realtime, Notifications & Support

**Goal**: Replace SignalR with Supabase Realtime; ticket system

### Tasks

- [ ] Supabase Realtime subscription per `client_id` channel
- [ ] Notification bell component (real-time unread count)
- [ ] Notification list drawer
- [ ] `supports`, `support_messages`, `support_files` tables + RLS
- [ ] Support ticket list (by role)
- [ ] Ticket detail page (message thread + file attachments)
- [ ] Create ticket form
- [ ] Close ticket action
- [ ] SMS notification on new ticket (Edge Function)
- [ ] Bale bot Edge Function (replaces BalePollingService)

**Deliverable**: Real-time notifications + full ticketing system

---

## Sprint 7 — Reports & PDF Generation

**Goal**: All 4 Stimulsoft report types re-implemented as PDF

### Tasks

- [ ] HTML report templates for all 4 report types
- [ ] Puppeteer Edge Function (`/api/reports/generate`)
- [ ] Signature overlay via `pdf-lib`
- [ ] Generated PDFs stored in Supabase Storage `reports/` bucket
- [ ] Report viewer dialog in UI
- [ ] Engineer quota report (accountant)
- [ ] Project list report (admin Excel export via `xlsx`)
- [ ] Invoice report PDF
- [ ] Metabase dashboard embed (signed JWT route)

**Deliverable**: All reports accessible; PDFs downloadable

---

## Sprint 8 — Responsive Polish & User-Facing Pages

**Goal**: Mobile-first responsive pass; post-login redirect from public site

### Tasks

- [ ] Responsive audit: every admin page at 375px, 768px, 1280px
- [ ] Mobile sidebar (drawer, hamburger)
- [ ] After public site login (`/login`) → redirect to `/admin` (KURDNEZAM panel)
- [ ] User profile page (edit name, phone, avatar upload)
- [ ] Change password page
- [ ] Theme colour picker (user preference persisted)
- [ ] Full dark/light theme verified on all new components
- [ ] Jalali date on every date field (audit)
- [ ] Empty states and loading skeletons on all pages
- [ ] 404 and error pages

**Deliverable**: Production-ready UX, all pages responsive

---

## Sprint 9 — Data Migration & Parallel Run

**Goal**: Migrate all existing data; run old + new systems in parallel

### Tasks

- [ ] SQL Server → PostgreSQL export scripts (CSV pipeline)
- [ ] File migration script (Liara S3 → Supabase Storage)
- [ ] User migration (force-reset flow with SMS)
- [ ] Row count validation queries
- [ ] Spot-check 20 projects end-to-end in new system
- [ ] Load test (simulate 50 concurrent users)
- [ ] Security audit: RLS pen-test, JWT claim audit
- [ ] Sentry Next.js SDK wired up
- [ ] Old `.NET` API kept alive at `api.kurdnezambargh.ir` during parallel run

**Deliverable**: All production data in Supabase; both systems operational

---

## Sprint 10 — Cutover & Decommission

**Goal**: DNS cutover; old system turned off

### Tasks

- [ ] Final data sync (delta since Sprint 9 migration)
- [ ] Update DNS: `api.kurdnezambargh.ir` → Next.js (or keep for backward compat during transition)
- [ ] Update `demo.kurdnezambargh.ir` → new app (already pointing here)
- [ ] Inform all users: new system URL, force-reset instructions
- [ ] Monitor error rates in Sentry for 48h post-cutover
- [ ] Disable old .NET API container (do NOT delete — archive for 90 days)
- [ ] Disable old React app container
- [ ] Post-cutover retrospective
- [ ] Update all docs

**Deliverable**: Single production system on Next.js + Supabase; old stack archived

---

## Module Status Board

| Module | Status | Sprint |
|---|---|---|
| Admin shell | ✅ Done | S0 |
| shadcn/ui design system | 🔲 Not started | S1 |
| Supabase Auth | 🔲 Not started | S1 |
| DB Schema (migrations) | 🔲 Not started | S2 |
| Engineers | 🔲 Not started | S2 |
| Quarter/Building/ERT Tariffs | 🔲 Not started | S2 |
| Projects (create+list) | 🔲 Not started | S3 |
| Project Processes (EPP) | 🔲 Not started | S4 |
| Accounting + Payments | 🔲 Not started | S5 |
| Realtime / Notifications | 🔲 Not started | S6 |
| Support Tickets | 🔲 Not started | S6 |
| PDF Reports | 🔲 Not started | S7 |
| Responsive Polish | 🔲 Not started | S8 |
| Data Migration | 🔲 Not started | S9 |
| Cutover | 🔲 Not started | S10 |
