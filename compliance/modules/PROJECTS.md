# Projects Module Spec
## ElectProject + ElectProjectProcess Migration

---

## Domain Overview

An **ElectProject** is the core business entity — a building electrical supervision project.  
It progresses through **9 lifecycle stages** (ProjectLevelEnum 0–9), managed by the **ElectProjectProcess** (EPP) sub-entity, which assigns an engineer to each stage.

---

## Project Lifecycle (ProjectLevel State Machine)

```
0: ثبت شده (Registered)
   ↓  [Admin assigns]
1: در انتظار بررسی (Pending Review)
   ↓  [Admin creates EPP with engineer]
2: کارشناسی (Expert Review)       ← Engineer fills CommentEngForm
   ↓
3: نقشه (Drawing/Map)             ← Engineer uploads map file
   ↓
4: تست (Testing)                  ← Engineer fills CheckListForm
   ↓
5: ارت (ERT/Earthing)             ← Engineer fills ErtForm
   ↓
6: تابلو (Panel)                  ← PanelMaker submits panel
   ↓
7: بازرسی (Inspection)            ← Engineer fills CheckListForm again
   ↓
8: تحویل (Delivery/Test&Delivery) ← Engineer uploads T&D document
   ↓
9: تکمیل شده (Completed)          ← Admin approves final
```

**Transitions that skip stages** are allowed based on project flags:
- `isEarthSystem = false` → skip stage 5
- `panelNeed = false` → skip stage 6
- `isTestAndDelivery = false` → skip stage 8

---

## Pages & Components

### Admin: `/admin/projects`
- Full-filter project list (by status, level, section, date range, search text)
- DataTable with ProjectLevelBadge, file number, landlord name, actions
- Export to Excel button
- New project button → `/admin/projects/new`

### Admin: `/admin/projects/new`
**Multi-step wizard** (5 steps):

**Step 1 – Owner Info**
```
Fields: landlordName*, landlordNaCode*, landlordPhoneNumber*, companyName, licenseNumber
```

**Step 2 – Building Info**
```
Fields: buildingType (enum), numberOfFloor*, desNumberOfFloor, amountPerArea, 
        projectTypeRequest (enum), isEarthSystem, panelNeed, isErtTest,
        isBuildingInspection, isTestAndDelivery, needElectNetwork, isBigProject,
        hasRelatedPermit, hasSupervision, isNeedEb
```

**Step 3 – Location**
```
Fields: provinceId*, cityId*, sectionId*, address*, postalCode,
        lat/lng (from map picker — Leaflet)
```

**Step 4 – Electricity Details**
```
Fields: branchingType, fazNumber, ampere, power, description
```

**Step 5 – File Upload**
```
Files: IdCard, ElectPlan, RelatedPermit, ErtMap, and others as applicable
Upload to Supabase Storage: project-files/{projectId}/
```

### Admin: `/admin/projects/[id]`
- Project detail view: all fields, timeline of stages, assigned engineer
- Actions: Submit, Stop, Delete (role-gated)
- Files section: view/download/add files
- EPP section: current stage, engineer name, status
- Comment/Checklist/ERT forms viewer

### Admin: `/admin/projects/[id]/process`
- Admin assigns engineer to a stage
- Form: select engineer, select building tariff, select quarter tariff
- Actions: EPP Approve, EPP Accept, EPP Change Engineer

### Engineer: `/admin/engineer-queue`
- List of projects assigned to logged-in engineer
- For each project/stage:
  - Expert stage: fill CommentEngForm
  - Map stage: upload map file
  - Checklist stage: fill CheckListForm
  - ERT stage: fill ElectProjectErtForm
  - Defect stage: fill defect description + files
  - T&D stage: upload test & delivery document

### EDC (ElectAdmin): `/admin/projects?role=edc`
- EDC-specific view: fill CheckListEdc
- Submit EDC approval

### PanelMaker: `/admin/projects?role=panel`
- View projects where `panelNeed = true` assigned to this panel maker
- Submit panel: upload panel file, enter panel serial number

---

## Server Actions

```typescript
// app/admin/projects/actions.ts
"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Get projects with full filter
export async function getProjects(filter: ProjectFilter) {
  const supabase = await getSupabaseClient();
  let query = supabase
    .from("elect_projects")
    .select(`
      *,
      sections(section_name),
      elect_project_processes(
        id, project_level, inspection_status, accepted,
        engineers(full_name)
      )
    `)
    .eq("is_delete", false)
    .order("created_at", { ascending: false });

  if (filter.status !== undefined) query = query.eq("elect_project_status", filter.status);
  if (filter.level !== undefined) query = query.eq("project_level", filter.level);
  if (filter.sectionId) query = query.eq("section_id", filter.sectionId);
  if (filter.search) query = query.ilike("file_number", `%${filter.search}%`);
  if (filter.dateFrom) query = query.gte("created_at", filter.dateFrom);
  if (filter.dateTo) query = query.lte("created_at", filter.dateTo);

  const { data, error } = await query
    .range((filter.page - 1) * filter.pageSize, filter.page * filter.pageSize - 1);

  if (error) throw error;
  return data;
}

// Upsert project
export async function upsertProject(data: Partial<ElectProject>) {
  const supabase = await getSupabaseClient();
  const { data: result, error } = await supabase
    .from("elect_projects")
    .upsert(toSnakeCase(data), { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/admin/projects");
  return result;
}

// Submit project (admin)
export async function submitProject(id: string) {
  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from("elect_projects")
    .update({ project_level: 1, elect_project_status: 1, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/admin/projects/${id}`);
  return { ok: true };
}

// Stop project
export async function stopProject(id: string, reason: string) {
  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from("elect_projects")
    .update({ is_stop: true, stop_des: reason, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/admin/projects/${id}`);
  return { ok: true };
}

// Soft delete
export async function deleteProject(id: string) {
  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from("elect_projects")
    .update({ is_delete: true, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/projects");
  return { ok: true };
}
```

---

## EPP Server Actions

```typescript
// app/admin/projects/[id]/actions.ts

// Assign engineer (creates EPP)
export async function assignEngineer(data: {
  electProjectId: string;
  engineerId: string;
  projectLevel: number;
  buildingTariffId: string;
  quarterTariffId: string;
}) {
  const supabase = await getSupabaseClient();
  const { data: epp, error } = await supabase
    .from("elect_project_processes")
    .insert({
      elect_project_id: data.electProjectId,
      engineer_id: data.engineerId,
      project_level: data.projectLevel,
      building_tariff_id: data.buildingTariffId,
      quarter_tariff_id: data.quarterTariffId,
      is_main: true,
    })
    .select()
    .single();
  if (error) throw error;
  revalidatePath(`/admin/projects/${data.electProjectId}`);
  return epp;
}

// Engineer approves EPP
export async function eppApprove(eppId: string) {
  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from("elect_project_processes")
    .update({ accepted: true, solar_accepted: toSolarDate(new Date()) })
    .eq("id", eppId);
  if (error) throw error;
  return { ok: true };
}

// Save CommentEngForm
export async function saveCommentEngForm(data: CommentEngFormInput) {
  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from("comment_eng_forms")
    .upsert(data, { onConflict: "epp_id" });
  if (error) throw error;
  return { ok: true };
}

// Save ERT Form
export async function saveErtForm(data: ErtFormInput) {
  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from("elect_project_ert_forms")
    .upsert(data, { onConflict: "epp_id" });
  if (error) throw error;
  return { ok: true };
}
```

---

## Key Enums (TypeScript)

```typescript
// src/types/enums.ts

export const BuildingType = {
  None: 0, Residential: 1, Commercial: 2,
  Official: 3, Industrial: 4, General: 5,
} as const;

export const BranchingType = {
  Domestic: 0, Public: 1, Industrial: 2,
  Other: 3, ExistingBranch: 4,
} as const;

export const FazNumber = {
  OneFaz: 0, ThreeFaz: 1, PermanentBranch: 2, TemporaryBranch: 3,
} as const;

export const FileElectProjectType = {
  None: 0, IdCard: 1, ElectPlan: 2, RelatedPermit: 3,
  ErtMap: 4, CheckListBoard: 5, Crooky: 6, ElectNetwork: 7,
  TestAndDelivery: 8, CrookyOfElectrode: 9, SupervisorApproveForm: 10,
  ExpertDocument: 11, ErtDocument: 12, TestAndDeliveryDocument: 13,
  SupervisionDocument: 14, AzbuiltMap: 15,
} as const;

export const InspectionDes = {
  Ides0: 0,  // وجود نقشه‌های تأیید شده
  Ides1: 1,  // وجود اشتراک برق
  // ... 26 items
} as const;

export const ProjectLevelLabel: Record<number, string> = {
  0: "ثبت شده",
  1: "در انتظار بررسی",
  2: "کارشناسی",
  3: "نقشه",
  4: "تست",
  5: "ارت",
  6: "تابلو",
  7: "بازرسی",
  8: "تحویل",
  9: "تکمیل شده",
};
```

---

## Deduction Calculation (from EngPaymentList)

```typescript
// src/lib/finance.ts

export interface DeductionResult {
  amountSystem: number;
  deduction1: number;  // 5% - بیمه
  deduction2: number;  // 1% - صندوق
  deduction3: number;  // 7% - واحد برق
  deduction4: number;  // 10% - افزوده
  sumAmountSystem: number;
  sumAmountWithFish: number;
}

export function calculateDeductions(grossAmount: number): DeductionResult {
  const d1 = grossAmount * 0.05;
  const d2 = grossAmount * 0.01;
  const d3 = grossAmount * 0.07;
  const d4 = grossAmount * 0.10;
  const totalDeductions = d1 + d2 + d3 + d4;
  return {
    amountSystem: grossAmount,
    deduction1: d1,
    deduction2: d2,
    deduction3: d3,
    deduction4: d4,
    sumAmountSystem: grossAmount - totalDeductions,
    sumAmountWithFish: grossAmount,
  };
}
```
