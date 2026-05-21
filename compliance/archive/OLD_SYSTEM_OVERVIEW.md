# Old System Overview (Frozen)
## vahedbargh-api-9 + vahedbargh-ui — Archived Reference

> This document is a frozen snapshot as of 2026-05-21.  
> Do not update. Use compliance/development-plans/ for current state.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 17.x, CRA + Craco, Redux + Redux-Saga |
| UI Libraries | Ant Design 5 + MUI 5 (mixed) |
| Backend | .NET 9, Clean Architecture (Domain/Application/Infrastructure/Persistence/Api) |
| ORM | Entity Framework Core 9 (SQL Server) + Npgsql (PostgreSQL audit) + SQLite (SignalR) |
| Auth | ASP.NET Core Identity + JWT HS512 |
| File Storage | Liara S3 (storage.iran.liara.site, bucket: vahedbarghfile) |
| Realtime | SignalR (.NET) |
| Background | IHostedService (no Hangfire) |
| PDF | Stimulsoft Reports 2023.1.1 + iTextSharp 5.5.13 |
| SMS | msgway.com (server) + gsotp.com (frontend — security risk) |
| Messaging | Bale Bot (long-polling) |
| Payment | IranKish/Shaparak (RSA tokenization) |
| Analytics | Metabase (embedded iframe, JWT auth) |

---

## Important Business Rules (Must Preserve)

1. **Payment deductions**: 5% insurance + 1% sandogh + 7% vahed bargh + 10% afzodeh
2. **Project state machine**: 9 stages, some skippable based on project flags
3. **Auto-cancel overdue**: EPP records older than threshold auto-cancelled daily
4. **Solar dates**: Every entity stores both Gregorian and Persian Solar dates
5. **Engineer quota**: Each engineer has a quota (default + quarter-based) limiting projects per period
6. **Multi-tenancy**: Every entity belongs to a `client` (organizational tenant)
7. **Engineer certifications**: cert_of_test, cert_of_earth, cert_of_fiber, cert_of_inspection filter project assignment eligibility
8. **Signature overlay**: Generated PDFs overlay engineer/executor/nezam signatures

---

## Old API Base URLs

- Production API: `https://api.kurdnezambargh.ir/api/v1.0`
- SignalR hub: `https://api.kurdnezambargh.ir/frontnotif`
- Old UI: `https://old.kurdnezambargh.ir` (React SPA)

---

## Roles (Preserved in new system)

```
Administrator — مدیر
SuperUser     — سوپر یوزر
Executor      — مجری
Engineer      — ناظر
Accountant    — حسابدار
Employee      — کارمند
PanelMaker    — تابلوساز
ElectAdmin    — برق‌ادمین (EDC operator)
Section       — بخش
Analyzer      — آنالیزور
```
