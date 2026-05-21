# KURDNEZAM — Compliance & Migration Index

> Migration from **vahedbargh-api-9** (.NET 9 + SQL Server) + **vahedbargh-ui** (React 17 + CRA)  
> Target: **vahedbargh-web** (Next.js 16 App Router + Supabase self-hosted)

---

## Folder Structure

| Folder | Contents |
|---|---|
| [`development-plans/`](./development-plans/) | Master migration plan, sprint roadmap, module checklist |
| [`backend/`](./backend/) | API mapping, DB schema migration, background jobs, integrations |
| [`frontend/`](./frontend/) | Component map, state management, design system, routing |
| [`modules/`](./modules/) | Feature-level specs: auth, projects, accounting, engineers, support |
| [`security/`](./security/) | RLS policies, secrets management, auth hardening |
| [`automation/`](./automation/) | CI/CD pipeline, deploy scripts, testing strategy |
| [`ops-runbooks/`](./ops-runbooks/) | Production runbooks: deploy, rollback, backup, incident response |
| [`archive/`](./archive/) | Frozen snapshots of old system decisions and API contracts |

---

## Quick Links

- [Master Migration Plan](./development-plans/MIGRATION_PLAN.md)
- [Sprint Roadmap](./development-plans/ROADMAP.md)
- [API Endpoint Mapping](./backend/API_MAPPING.md)
- [Database Schema Migration](./backend/DATABASE_SCHEMA.md)
- [Background Jobs](./backend/BACKGROUND_JOBS.md)
- [External Integrations](./backend/INTEGRATIONS.md)
- [Frontend Component Map](./frontend/COMPONENT_MAP.md)
- [State Management Migration](./frontend/STATE_MANAGEMENT.md)
- [Design System](./frontend/DESIGN_SYSTEM.md)
- [Auth Module Spec](./modules/AUTH.md)
- [Projects Module Spec](./modules/PROJECTS.md)
- [Accounting Module Spec](./modules/ACCOUNTING.md)
- [Engineers Module Spec](./modules/ENGINEERS.md)
- [Support Module Spec](./modules/SUPPORT.md)
- [Security Policy](./security/SECURITY.md)
- [RLS Policies](./security/RLS_POLICIES.md)
- [CI/CD Pipeline](./automation/CI_CD.md)
- [Deploy Runbook](./ops-runbooks/DEPLOY.md)
- [Incident Response](./ops-runbooks/INCIDENT_RESPONSE.md)

---

## Stack Comparison

| Layer | Old | New |
|---|---|---|
| Frontend | React 17 + CRA + Craco | Next.js 16 App Router + TypeScript |
| UI Library | Ant Design 5 + MUI 5 (mixed) | shadcn/ui + Tailwind CSS v4 |
| State | Redux + Redux-Saga (20 slices) | TanStack Query v5 + Zustand |
| Routing | React Router v5 | Next.js App Router |
| i18n | i18next | next-intl |
| Calendar | react-multi-date-picker | react-multi-date-picker (keep) |
| Auth | Custom JWT in localStorage | Supabase Auth (JWT + RLS) |
| Backend | .NET 9 Clean Architecture (CQRS) | Next.js Server Actions + API Routes |
| Database | SQL Server (main) + PostgreSQL (audit) + SQLite (SignalR) | Supabase PostgreSQL (unified) |
| File Storage | Liara S3 | Supabase Storage |
| Realtime | SignalR (.NET) | Supabase Realtime |
| Background Jobs | .NET IHostedService | pg_cron + Supabase Edge Functions |
| PDF Reports | Stimulsoft Reports + iTextSharp | Puppeteer/HTML or pdf-lib |
| Payments | IranKish/Shaparak | IranKish (ported to Next.js API route) |
| SMS | msgway.com | msgway.com (same, via Edge Function) |
| Notifications | SignalR push | Supabase Realtime channels |
| Monitoring | Sentry | Sentry (Next.js SDK) |

---

## Tenant Architecture

The system is **multi-tenant** — every business entity has a `client_id` FK.  
In Supabase, Row Level Security (RLS) enforces this at the DB layer using `auth.jwt() ->> 'cid'` claim.

---

## Project Roles

| Role | Persian | Access Level |
|---|---|---|
| `Administrator` | مدیر | Full access |
| `SuperUser` | سوپر یوزر | Cross-tenant admin |
| `Executor` | مجری | Project executor |
| `Engineer` | ناظر | Assigned projects only |
| `Accountant` | حسابدار | Finance views |
| `Employee` | کارمند | Read-heavy |
| `PanelMaker` | تابلوساز | Panel submission only |
| `ElectAdmin` | برق‌ادمین | EDC operator |
| `Section` | بخش | Section-level admin |
| `Analyzer` | آنالیزور | Analytics only |

---

*Last updated: 2026-05-21*
