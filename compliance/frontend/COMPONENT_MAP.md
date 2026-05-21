# Frontend Component Map
## React 17 (vahedbargh-ui) → Next.js 16 (vahedbargh-web)

---

## Pages / Routes

| Old Route | Old Component | New Route | New Component | Status |
|---|---|---|---|---|
| `/login` | `Login` | `/login` (public) + `/admin/login` | `app/admin/login/page.tsx` | ✅ |
| `/logout` | `Logout` | `app/admin/logout/` | server action | ✅ |
| `/dashboard` | `Dashboard` | `/admin` | `app/admin/page.tsx` | 🔲 |
| `/BaseInfo/ExeEng` | `BaseInfo` | `/admin/engineers` | `app/admin/engineers/page.tsx` | 🔲 |
| `/projects/ElectProjects` | `ElectProjects` | `/admin/projects` | `app/admin/projects/page.tsx` | 🔲 |
| `/projects/create` | `CreateProject (admin)` | `/admin/projects/new` | `app/admin/projects/new/page.tsx` | 🔲 |
| `/projects/CreateProject` | `CreateProject (EDC)` | `/admin/projects/new?type=edc` | same + `?type` | 🔲 |
| `/projects/ElectProjectProcessEng` | `ElectProjectProcessEng` | `/admin/engineer-queue` | `app/admin/engineer-queue/page.tsx` | 🔲 |
| `/projects/ElectProjectProcess` | `ElectProjectProcess` | `/admin/projects/[id]/process` | `app/admin/projects/[id]/process/page.tsx` | 🔲 |
| `/projects/ElectProjectProcessList` | `ElectProjectProcessList` | `/admin/projects/processes` | `app/admin/projects/processes/page.tsx` | 🔲 |
| `/projects/ElectProjectsEdc` | `ElectProjectsEdc` | `/admin/projects?role=edc` | same + role param | 🔲 |
| `/projects/ElectProjectsPanelMaker` | `ElectProjectsPanelMaker` | `/admin/projects?role=panel` | same + role param | 🔲 |
| `/EngWork` | `EngWork` | `/admin/eng-work` | `app/admin/eng-work/page.tsx` | 🔲 |
| `/profile` | `UserProfile` | `/admin/profile` | `app/admin/profile/page.tsx` | 🔲 |
| `/accounting` | `Accounting` | `/admin/accounting` | `app/admin/accounting/page.tsx` | 🔲 |
| `/accounting/EngPayment` | `EngPayment` | `/admin/accounting/eng-payment` | `app/admin/accounting/eng-payment/page.tsx` | 🔲 |
| `/userFile` | `UserFiles` | `/admin/profile/files` | `app/admin/profile/files/page.tsx` | 🔲 |
| `/support` | `Support` | `/admin/support` | `app/admin/support/page.tsx` | 🔲 |
| `/support/:id` | `TicketDetail` | `/admin/support/[id]` | `app/admin/support/[id]/page.tsx` | 🔲 |
| `/reports/electProjects` | `Reports` | `/admin/reports/projects` | `app/admin/reports/projects/page.tsx` | 🔲 |
| `/reports/engInvoices` | `EngInvoiceReport` | `/admin/reports/eng-invoices` | `app/admin/reports/eng-invoices/page.tsx` | 🔲 |
| `/reports/engReports` | `EngReports` | `/admin/reports/eng` | `app/admin/reports/eng/page.tsx` | 🔲 |
| `/plan` | `PipingPlan` | `/admin/plan` | `app/admin/plan/page.tsx` | 🔲 |
| `/tp` | `TransactionPublic` | `/payment/result` | `app/payment/result/page.tsx` | 🔲 |
| `/ep` | `ProjectPublic` | `/project-info` | `app/project-info/page.tsx` | 🔲 |
| `/register` | `Register` | n/a (invite-only) | deprecated | — |
| `/forgot-password` | `ForgetPassword` | `/admin/login?reset=1` | inline in login page | 🔲 |

---

## Shared Components Migration

### Layout

| Old | New |
|---|---|
| `VerticalLayout/index.js` | `app/admin/layout.tsx` + `AdminSidebar` |
| `VerticalLayout/Sidebar.js` | `components/admin/AdminSidebar.tsx` ✅ |
| `VerticalLayout/Header.js` | `components/admin/AdminHeader.tsx` |
| `VerticalLayout/Footer.js` | Inline in admin layout |
| `NonAuthLayout.js` | `app/(public)/layout.tsx` |

### Forms & Inputs

| Old Component | New Component | Library |
|---|---|---|
| `PersianDatePicker.js` | `components/ui/PersianDatePicker.tsx` | react-multi-date-picker (keep) |
| `PersianDatePickerInline.js` | `components/ui/PersianDatePickerInline.tsx` | react-multi-date-picker |
| `Locations.js` (province/city/section) | `components/ui/LocationSelect.tsx` | shadcn/ui Select |
| `NumericInput.js` | shadcn/ui Input + `react-number-format` | shadcn/ui |
| `TextMask.js` | shadcn/ui Input + `react-imask` | shadcn/ui |
| `Ant/FloatInput/` | shadcn/ui floating label variant | shadcn/ui |
| Ant Design `Table` | shadcn/ui `DataTable` (TanStack Table) | shadcn/ui |
| Ant Design `Modal` | shadcn/ui `Dialog` | shadcn/ui |
| Ant Design `Drawer` | shadcn/ui `Sheet` | shadcn/ui |
| Ant Design `Form` | React Hook Form | react-hook-form |
| Ant Design `Select` | shadcn/ui `Select` or `Combobox` | shadcn/ui |
| Ant Design `DatePicker` | `PersianDatePicker` (Jalali) | react-multi-date-picker |
| MUI `DataGrid` | shadcn/ui `DataTable` (TanStack Table) | shadcn/ui |
| `toastr` notifications | shadcn/ui `Sonner` toast | sonner |

### Files & Uploads

| Old | New |
|---|---|
| `FilePondUpload.js` (filepond) | `components/ui/FileUpload.tsx` (shadcn + native) |
| `SingleFileUpload.js` | `components/ui/SingleFileUpload.tsx` |
| `GridFiles.js` / `GridFilesAnt.js` | `components/ui/FileGrid.tsx` (shadcn DataTable) |
| `GridSupportFiles.js` | inline in support ticket page |
| `GridUserFiles.js` | inline in profile files page |

### Maps

| Old | New |
|---|---|
| `MapComp.js` (react-leaflet) | `components/ui/MapPicker.tsx` (react-leaflet, keep) |

### Reports

| Old | New |
|---|---|
| `ReportDialog.js` (Stimulsoft viewer) | `components/ui/ReportDialog.tsx` (PDF iframe) |

### Notifications

| Old | New |
|---|---|
| SignalR `initializeSocket()` | `components/providers/RealtimeProvider.tsx` |
| Redux `getUserInfo()` on push | Supabase Realtime subscription |

---

## State Management Migration

| Old (Redux-Saga) | New (TanStack Query + Zustand) |
|---|---|
| `ElectProjects` slice (40+ actions) | `useQuery` + `useMutation` hooks in `src/hooks/use-projects.ts` |
| `Engineers` slice | `src/hooks/use-engineers.ts` |
| `Accounting` slice | `src/hooks/use-accounting.ts` |
| `ElectProjectProcesses` slice | `src/hooks/use-epp.ts` |
| `Supports` slice | `src/hooks/use-support.ts` |
| `USERs` slice | `src/hooks/use-users.ts` |
| `Layout` slice (sidebar collapse) | Zustand `useUIStore` |
| `Login` slice | Supabase Auth + Next.js middleware |
| `Payment` slice | `src/hooks/use-payment.ts` |
| `Quotas` slice | `src/hooks/use-quotas.ts` |
| `EngPayment` slice | `src/hooks/use-eng-payment.ts` |

---

## TypeScript Interfaces (replacing JS models)

Create `src/types/` with:

```typescript
// src/types/project.ts
export type ProjectLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type BuildingType = "residential" | "commercial" | "official" | "industrial" | "general";
export type BranchingType = "domestic" | "public" | "industrial" | "other" | "existing";
export type FazNumber = "one_faz" | "three_faz" | "permanent" | "temporary";

export interface ElectProject {
  id: string;
  clientId: string;
  fileNumber: string | null;
  electRequestNumber: string | null;
  userId: string;
  sectionId: number | null;
  address: string | null;
  landlordName: string;
  landlordNaCode: string;
  landlordPhoneNumber: string;
  numberOfFloor: number;
  projectLevel: ProjectLevel;
  buildingType: BuildingType;
  electProjectStatus: number;
  isOk: boolean;
  isStop: boolean;
  isDelete: boolean;
  panelNeed: boolean;
  isEarthSystem: boolean;
  isErtTest: boolean;
  lat: number | null;
  lng: number | null;
  solarCreated: string | null;
  createdAt: string;
}

export interface ElectProjectProcess {
  id: string;
  clientId: string;
  electProjectId: string;
  engineerId: string | null;
  projectLevel: ProjectLevel;
  inspectionStatus: number;
  fee: number;
  accepted: boolean;
  isMain: boolean;
  isDelete: boolean;
  createdAt: string;
}
```

---

## Key Dependency Decisions

| Library | Decision | Reason |
|---|---|---|
| `react-multi-date-picker` | **Keep** | Already works with Persian calendar; no need to replace |
| `react-date-object` | **Keep** | Paired with above |
| `jalaali-js` | **Add** | Server-side Jalali conversions |
| `react-leaflet` | **Keep** | Map picker for project location |
| `filepond` | **Replace** | shadcn/ui native upload component |
| `antd` | **Remove** | Replace all with shadcn/ui |
| `@mui/material` | **Remove** | Replace DataGrid with TanStack Table |
| `redux` + `redux-saga` | **Remove** | TanStack Query + Zustand |
| `i18next` | **Replace** | `next-intl` (better App Router integration) |
| `axios` | **Remove** | Native fetch (server components) + TanStack Query |
| `jwt-decode` | **Remove** | Supabase session has parsed claims |
| `@microsoft/signalr` | **Remove** | Supabase Realtime |
| `xlsx` | **Keep** | Export spreadsheets |
| `file-saver` | **Keep** | Trigger browser download |
| `react-number-format` | **Keep** | Persian numeral formatting |
| `imask` | **Keep** | Phone/national-code masks |
| `react-hook-form` | **Add** | Replaces redux-form |
| `zod` | **Add** | Schema validation |
| `@tanstack/react-query` | **Add** | Server state management |
| `zustand` | **Add** | UI state management |
| `sonner` | **Add** | Toast notifications |
| `next-intl` | **Add** | i18n |
| `@sparticuz/chromium` | **Add** | Puppeteer for PDF generation |
| `pdf-lib` | **Add** | PDF signature overlay |
