# Engineers Module Spec

---

## Pages

| Route | Role | Description |
|---|---|---|
| `/admin/engineers` | Admin, Accountant, Section | Engineer list with search + filter |
| `/admin/engineers/new` | Admin | Create new engineer |
| `/admin/engineers/[id]` | Admin, Accountant | Engineer detail + edit + history |
| `/admin/engineers/[id]/files` | Admin, Engineer | Engineer document files |

---

## Engineer Fields

```typescript
interface Engineer {
  id: string;
  clientId: string;
  userId: string | null;  // linked auth user (optional)
  fullName: string;
  naCode: string;          // کد ملی (10 digits)
  cellPhone: string;
  email: string;
  dadName: string;
  tell: string;
  address: string;
  sectionId: number;
  fieldType: number;       // FieldTypeEnum: رشته تخصصی
  educationType: number;   // مدرک تحصیلی
  maritalStatusType: number;
  relatedType: number;
  bankAccountNumber: string;
  defaultQuota: number;    // سقم کوتا پایه
  // Certifications
  certOfTest: boolean;     // مدرک تست و تحویل
  certOfEarth: boolean;    // مدرک ارت
  certOfFiber: boolean;    // مدرک فیبر نوری
  certOfInspection: boolean; // گواهی بازرسی
  // Status
  inactive: boolean;
  isDelete: boolean;
  sortIndex: number;
  bankAccountBlocked: boolean;
  has1Percent: boolean;
  hasQuarterIncrease: boolean;
  // Dates
  solarBirthDate: string;
  solarMembershipDate: string;
}
```

---

## Server Actions

```typescript
// app/admin/engineers/actions.ts

export async function getEngineers(filter?: EngineerFilter) {
  const supabase = await getSupabaseClient();
  let query = supabase
    .from("engineers")
    .select("*, sections(section_name), engineer_histories(*)")
    .eq("is_delete", false);

  if (filter?.search) query = query.ilike("full_name", `%${filter.search}%`);
  if (filter?.sectionId) query = query.eq("section_id", filter.sectionId);
  if (filter?.inactive !== undefined) query = query.eq("inactive", filter.inactive);

  const { data, error } = await query.order("sort_index");
  if (error) throw error;
  return data;
}

export async function upsertEngineer(data: Partial<Engineer>) {
  const supabase = await getSupabaseClient();
  const { data: result, error } = await supabase
    .from("engineers")
    .upsert(toSnakeCase(data), { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/admin/engineers");
  return result;
}

export async function addEngineerHistory(engineerId: string, description: string) {
  const supabase = await getSupabaseClient();
  const { error } = await supabase.from("engineer_histories").insert({
    engineer_id: engineerId,
    description,
  });
  if (error) throw error;
  revalidatePath(`/admin/engineers/${engineerId}`);
}
```

---

## Quota Burn Management

```typescript
// app/admin/quotas/actions.ts

export async function getQuotaBurnList(filter: QuotaFilter) {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("eng_quota_burns")
    .select("*, engineers(full_name), quarter_tariffs(year, quarter_type)")
    .eq("is_approved", false);
  if (error) throw error;
  return data;
}

export async function approveQuotaBurn(id: string) {
  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from("eng_quota_burns")
    .update({ is_approved: true })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/quotas");
}
```
