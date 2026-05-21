# API Endpoint Mapping
## .NET API → Next.js Server Actions / API Routes

> Every old endpoint gets either a Server Action (for form mutations) or  
> an API Route (for browser redirects, external callbacks, file serving).

---

## Legend

| Symbol | Meaning |
|---|---|
| `SA` | Next.js Server Action in `actions.ts` |
| `AR` | Next.js API Route in `app/api/` |
| `SC` | Data fetched directly in Server Component |
| ✅ | Implemented |
| 🔲 | Not yet implemented |

---

## Auth / Identity

| Old Endpoint | Method | New Location | Type | Status |
|---|---|---|---|---|
| `/Identity/Login` | POST | `app/admin/login/actions.ts` → Supabase Auth | SA | ✅ |
| `/Identity/LoginByCode` | POST | `app/admin/login/actions.ts` → Supabase verifyOTP | SA | 🔲 |
| `/Identity/Logout` | POST | `app/admin/logout/actions.ts` | SA | ✅ |
| `/Identity/ChangePassword` | POST | `app/admin/profile/actions.ts` | SA | 🔲 |
| `/Identity/ChangeToDefaultPassword` | POST | `app/admin/profile/actions.ts` | SA | 🔲 |
| `/Identity/PaymentMelliPublic` | POST | `app/api/payment/public/route.ts` | AR | 🔲 |

---

## Users & Clients

| Old Endpoint | Method | New Location | Type | Status |
|---|---|---|---|---|
| `/Users/GetUserInfo` | GET | Server Component reads from `profiles` | SC | 🔲 |
| `/Users/GetAvatar` | GET | Supabase Storage signed URL | AR | 🔲 |
| `/Users/GetAreas` | GET | Server Component | SC | 🔲 |
| `/Users/GetUserBalance` | GET | Server Component | SC | 🔲 |
| `/Users/GetUsersForSupport` | GET | Server Component | SC | 🔲 |
| `/Users/AddFile` | POST | `app/admin/profile/actions.ts` → Supabase Storage | SA | 🔲 |
| `/Users/DeleteFile` | POST | `app/admin/profile/actions.ts` | SA | 🔲 |
| `/Users/GetUserFiles` | GET | Server Component | SC | 🔲 |
| `/Users/GetUserFile` | GET | `app/api/files/route.ts` → signed URL redirect | AR | 🔲 |
| `/Users/GetPhysicalFileS3` | GET | `app/api/files/s3/route.ts` → Supabase Storage | AR | 🔲 |
| `/Users/GetPhysicalZipFileS3` | POST | `app/api/files/zip/route.ts` | AR | 🔲 |
| `/Clients/GetAllUsers` | GET | `app/admin/users/page.tsx` | SC | 🔲 |
| `/Clients/AddUser` | POST | `app/admin/users/actions.ts` | SA | 🔲 |
| `/Clients/UpdateUser` | POST | `app/admin/users/actions.ts` | SA | 🔲 |
| `/Clients/DeleteUser` | POST | `app/admin/users/actions.ts` | SA | 🔲 |

---

## Engineers

| Old Endpoint | Method | New Location | Type | Status |
|---|---|---|---|---|
| `/Engineers/GetEngineerByClient` | GET | `app/admin/engineers/page.tsx` | SC | 🔲 |
| `/Engineers/UpsertEngineer` | POST | `app/admin/engineers/actions.ts` | SA | 🔲 |
| `/Engineers/UpsertEngHistory` | POST | `app/admin/engineers/[id]/actions.ts` | SA | 🔲 |

---

## Elect Projects

| Old Endpoint | Method | New Location | Type | Status |
|---|---|---|---|---|
| `/ElectProjects/GetClientElectProjectsFullFilter` | POST | `app/admin/projects/page.tsx` | SC | 🔲 |
| `/ElectProjects/Upsert` | POST | `app/admin/projects/actions.ts` | SA | 🔲 |
| `/ElectProjects/UpdateElectProject` | POST | `app/admin/projects/[id]/actions.ts` | SA | 🔲 |
| `/ElectProjects/UpdateElectProjectDetails` | POST | `app/admin/projects/[id]/actions.ts` | SA | 🔲 |
| `/ElectProjects/AddFile` | POST | `app/admin/projects/[id]/actions.ts` → Supabase Storage | SA | 🔲 |
| `/ElectProjects/GetElectProjectFilesById` | GET | `app/admin/projects/[id]/page.tsx` | SC | 🔲 |
| `/ElectProjects/SubmitByAdmin` | POST | `app/admin/projects/[id]/actions.ts` | SA | 🔲 |
| `/ElectProjects/DeleteElectProject` | POST | `app/admin/projects/[id]/actions.ts` | SA | 🔲 |
| `/ElectProjects/StopElectProject` | POST | `app/admin/projects/[id]/actions.ts` | SA | 🔲 |
| `/ElectProjects/UpsertComment` | POST | `app/admin/projects/[id]/engineer/actions.ts` | SA | 🔲 |
| `/ElectProjects/UpsertCheckList` | POST | `app/admin/projects/[id]/engineer/actions.ts` | SA | 🔲 |
| `/ElectProjects/UpsertCheckListEdc` | POST | `app/admin/projects/[id]/engineer/actions.ts` | SA | 🔲 |
| `/ElectProjects/UpsertErtForm` | POST | `app/admin/projects/[id]/engineer/actions.ts` | SA | 🔲 |
| `/ElectProjects/GetPanelMaker` | GET | Server Component | SC | 🔲 |
| `/ElectProjects/AddPanelMaker` | POST | Server Action | SA | 🔲 |
| `/ElectProjects/SubmitPanel` | POST | Server Action | SA | 🔲 |
| `/ElectProjects/AmountSms` | POST | `app/api/sms/route.ts` | AR | 🔲 |
| `/ElectProjects/UpdateElectProjectStatus` | POST | Server Action | SA | 🔲 |
| `/ElectProjects/UpdateDefectDes` | POST | Server Action | SA | 🔲 |
| `/ElectProjects/UpdateByEdc` | POST | Server Action | SA | 🔲 |
| `/ElectProjects/GetProjectInfo` | POST | `app/ep/page.tsx` (public) | SC | 🔲 |

---

## Project Processes (EPP)

| Old Endpoint | Method | New Location | Type | Status |
|---|---|---|---|---|
| `/ElectProjectProcesses/GetProjectProcessByEpId` | GET | `app/admin/projects/[id]/page.tsx` | SC | 🔲 |
| `/ElectProjectProcesses/ProjectProcess` | POST | `app/admin/projects/[id]/actions.ts` | SA | 🔲 |
| `/ElectProjectProcesses/GetListProjectProcessEng` | POST | `app/admin/engineer-queue/page.tsx` | SC | 🔲 |
| `/ElectProjectProcesses/DeleteProjectProcess` | GET | `app/admin/projects/[id]/actions.ts` | SA | 🔲 |
| `/ElectProjectProcesses/EppApproved` | POST | `app/admin/projects/[id]/actions.ts` | SA | 🔲 |
| `/ElectProjectProcesses/EppAccepted` | POST | `app/admin/projects/[id]/actions.ts` | SA | 🔲 |
| `/ElectProjectProcesses/EppEngChange` | POST | `app/admin/projects/[id]/actions.ts` | SA | 🔲 |
| `/ElectProjectProcesses/UpdateStatusExpertStageByEng` | POST | `app/admin/projects/[id]/engineer/actions.ts` | SA | 🔲 |
| `/ElectProjectProcesses/UpdateStatusMapStageByEng` | POST | `app/admin/projects/[id]/engineer/actions.ts` | SA | 🔲 |
| `/ElectProjectProcesses/UpdateStatusDefectStageByEng` | POST | `app/admin/projects/[id]/engineer/actions.ts` | SA | 🔲 |

---

## Transactions / Accounting

| Old Endpoint | Method | New Location | Type | Status |
|---|---|---|---|---|
| `/Transactions/GetClientUserTransactions` | POST | `app/admin/accounting/page.tsx` | SC | 🔲 |
| `/Transactions/GetClientInvoices` | GET | `app/admin/accounting/invoices/page.tsx` | SC | 🔲 |
| `/Transactions/GetClientEngWork` | GET | `app/admin/accounting/eng-work/page.tsx` | SC | 🔲 |
| `/Transactions/GetEngClientInvoices` | GET | `app/admin/accounting/eng-invoices/page.tsx` | SC | 🔲 |
| `/Transactions/PaymentCustom` | POST | `app/admin/accounting/actions.ts` | SA | 🔲 |
| `/Transactions/EngPaymentCustom` | POST | `app/admin/accounting/actions.ts` | SA | 🔲 |
| `/Transactions/PaymentMelli` | POST | `app/api/payment/initiate/route.ts` | AR | 🔲 |
| `/Transactions/PaymentMelliReturn` | POST | `app/api/payment/return/route.ts` | AR | 🔲 |
| `/Transactions/PaymentMelliPublicReturn` | POST | `app/api/payment/public-return/route.ts` | AR | 🔲 |
| `/Transactions/UpsertEngPaymentList` | POST | `app/admin/accounting/eng-payment/actions.ts` | SA | 🔲 |
| `/Transactions/UpdateEngPaymentList` | POST | `app/admin/accounting/eng-payment/actions.ts` | SA | 🔲 |
| `/Transactions/GetEngPaymentList` | GET | `app/admin/accounting/eng-payment/page.tsx` | SC | 🔲 |
| `/Transactions/GetEngPaymentTasks` | GET | `app/admin/accounting/eng-payment/page.tsx` | SC | 🔲 |
| `/Transactions/EngPaymentApproved` | POST | `app/admin/accounting/eng-payment/actions.ts` | SA | 🔲 |

---

## Quotas

| Old Endpoint | Method | New Location | Type | Status |
|---|---|---|---|---|
| `/Quotas/GetEngQuotaBurnList` | GET | `app/admin/quotas/page.tsx` | SC | 🔲 |
| `/Quotas/EngQuotaBurnApproved` | POST | `app/admin/quotas/actions.ts` | SA | 🔲 |
| `/Quotas/EngQuotaBurnUpdate` | POST | `app/admin/quotas/actions.ts` | SA | 🔲 |

---

## Quarter Tariffs

| Old Endpoint | Method | New Location | Type | Status |
|---|---|---|---|---|
| `/QuarterTariffs/GetQuarterTariffs` | GET | `app/admin/tariffs/page.tsx` | SC | 🔲 |

---

## Support / Tickets

| Old Endpoint | Method | New Location | Type | Status |
|---|---|---|---|---|
| `/Supports/GetSupports` | GET | `app/admin/support/page.tsx` | SC | 🔲 |
| `/Supports/Upsert` | POST | `app/admin/support/actions.ts` | SA | 🔲 |
| `/Supports/GetTickets` | GET | `app/admin/support/[id]/page.tsx` | SC | 🔲 |
| `/Supports/UpsertTicket` | POST | `app/admin/support/[id]/actions.ts` | SA | 🔲 |
| `/Supports/ClosedSupport` | POST | `app/admin/support/[id]/actions.ts` | SA | 🔲 |
| `/Supports/AddFile` | POST | `app/admin/support/[id]/actions.ts` → Storage | SA | 🔲 |
| `/Supports/GetSupportFiles` | GET | `app/admin/support/[id]/page.tsx` | SC | 🔲 |
| `/Supports/DeleteFile` | POST | `app/admin/support/[id]/actions.ts` | SA | 🔲 |

---

## Reports & Notifications

| Old Endpoint | Method | New Location | Type | Status |
|---|---|---|---|---|
| `/MetaBase/GetDashboardToken` | GET | `app/api/metabase/route.ts` | AR | 🔲 |
| `/Notification/SendSms` | POST | `app/api/sms/route.ts` (internal) | AR | 🔲 |
| `/Routes/GetAll` | GET | Static config in `src/config/nav.ts` | — | 🔲 |
| `/RequestDemo/RequestDemo` | POST | `app/api/demo/route.ts` | AR | 🔲 |

---

## File Serving Routes

Old system served all files through the API with a Bearer token.  
New system: all files in Supabase Storage with signed URLs (or public bucket for non-sensitive files).

| Old Proxy | New Approach |
|---|---|
| `GET /Users/GetPhysicalFileS3?path=Upload/ElectProjects/*` | Supabase Storage signed URL, `project-files` bucket |
| `GET /Users/GetPhysicalFileS3?path=Upload/Supports/*` | Supabase Storage signed URL, `support-files` bucket |
| `GET /Users/GetPhysicalFileS3?path=Upload/UserFiles/*` | Supabase Storage signed URL, `user-files` bucket |
| `GET /Users/GetPhysicalZipFileS3` (multi-file zip) | Edge Function: zip multiple Storage objects → stream |
| Local files (signatures, avatars) | Supabase Storage `signatures/` bucket |

---

## New Routes (no old equivalent)

These pages exist in the new system but had no dedicated route in the old API:

| Route | Description |
|---|---|
| `app/admin/settings/page.tsx` | Site settings (already built) |
| `app/admin/stats/page.tsx` | Admin stats CRUD (already built) |
| `app/api/reports/generate/route.ts` | PDF generation via Puppeteer |
| `app/admin/dashboard/page.tsx` | New unified dashboard |
| `app/api/realtime/route.ts` | Supabase Realtime config endpoint |
