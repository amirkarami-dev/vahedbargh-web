# State Management Migration
## Redux + Redux-Saga (20 slices) → TanStack Query v5 + Zustand

---

## Philosophy

Old system: Redux stores **everything** — both server state (API data) and UI state.  
New system: clear separation:

| Type | Tool | Examples |
|---|---|---|
| Server state (API data, lists, forms) | **TanStack Query v5** | project list, engineer list, invoices |
| UI-only state (modals, sidebar, theme) | **Zustand** | sidebarOpen, selectedTab, confirmDialog |
| Form state | **React Hook Form + Zod** | all create/edit forms |
| Auth state | **Supabase Auth + Next.js middleware** | session, user, role |

---

## TanStack Query Setup

```typescript
// components/providers/QueryProvider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,       // 1 minute
        gcTime: 5 * 60 * 1000,      // 5 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

## Migrating Each Redux Slice

### ElectProjects Slice → use-projects.ts

```typescript
// hooks/use-projects.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProjects,
  upsertProject,
  deleteProject,
  stopProject,
} from "@/app/admin/projects/actions";
import type { ElectProject, ProjectFilter } from "@/types/project";

export const projectKeys = {
  all: ["projects"] as const,
  list: (filter: ProjectFilter) => [...projectKeys.all, "list", filter] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
};

export function useProjects(filter: ProjectFilter) {
  return useQuery({
    queryKey: projectKeys.list(filter),
    queryFn: () => getProjects(filter),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => getProjectById(id),
    enabled: !!id,
  });
}

export function useUpsertProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ElectProject>) => upsertProject(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
```

### Engineers Slice → use-engineers.ts

```typescript
// hooks/use-engineers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEngineers, upsertEngineer } from "@/app/admin/engineers/actions";

export const engineerKeys = {
  all: ["engineers"] as const,
  list: (clientId: string) => [...engineerKeys.all, clientId] as const,
};

export function useEngineers() {
  return useQuery({
    queryKey: engineerKeys.all,
    queryFn: getEngineers,
  });
}

export function useUpsertEngineer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upsertEngineer,
    onSuccess: () => qc.invalidateQueries({ queryKey: engineerKeys.all }),
  });
}
```

### USERs Slice → use-users.ts

```typescript
// hooks/use-users.ts
import { useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";

export function useCurrentUser() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("*, user_roles(*)")
        .eq("id", user.id)
        .single();
      return profile;
    },
  });
}

export function useAllUsers() {
  return useQuery({
    queryKey: ["all-users"],
    queryFn: getAllUsers,  // Server action
  });
}
```

### Accounting Slice → use-accounting.ts

```typescript
// hooks/use-accounting.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useTransactions(filter: TransactionFilter) {
  return useQuery({
    queryKey: ["transactions", filter],
    queryFn: () => getTransactions(filter),
  });
}

export function useInvoices(filter?: InvoiceFilter) {
  return useQuery({
    queryKey: ["invoices", filter],
    queryFn: () => getInvoices(filter),
  });
}

export function useEngPaymentLists(taskId?: string) {
  return useQuery({
    queryKey: ["eng-payment-lists", taskId],
    queryFn: () => getEngPaymentLists(taskId),
    enabled: !!taskId,
  });
}
```

### Supports Slice → use-support.ts

```typescript
// hooks/use-support.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useSupports(filter: SupportFilter) {
  return useQuery({
    queryKey: ["supports", filter],
    queryFn: () => getSupports(filter),
  });
}

export function useTickets(supportId: string) {
  return useQuery({
    queryKey: ["tickets", supportId],
    queryFn: () => getTickets(supportId),
    enabled: !!supportId,
  });
}

export function useAddTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addTicket,
    onSuccess: (_, { supportId }) => {
      qc.invalidateQueries({ queryKey: ["tickets", supportId] });
    },
  });
}
```

---

## Zustand Store (UI state)

```typescript
// store/ui-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  // Confirm dialog
  confirmDialog: {
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  } | null;
  openConfirm: (opts: { title: string; description: string; onConfirm: () => void }) => void;
  closeConfirm: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      confirmDialog: null,
      openConfirm: (opts) => set({ confirmDialog: { ...opts, open: true } }),
      closeConfirm: () => set({ confirmDialog: null }),
    }),
    { name: "ui-store", partialize: (s) => ({ sidebarOpen: s.sidebarOpen }) }
  )
);
```

---

## Form Pattern (React Hook Form + Zod)

```typescript
// Example: CreateEngineerForm
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUpsertEngineer } from "@/hooks/use-engineers";
import { toast } from "sonner";

const engineerSchema = z.object({
  fullName: z.string().min(3, "نام باید حداقل ۳ حرف باشد"),
  naCode: z.string().length(10, "کد ملی باید ۱۰ رقم باشد"),
  cellPhone: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست"),
  email: z.string().email("ایمیل معتبر نیست").optional().or(z.literal("")),
  sectionId: z.number().int().positive("بخش را انتخاب کنید"),
});

type EngineerFormValues = z.infer<typeof engineerSchema>;

export function EngineerForm({ initial }: { initial?: Partial<EngineerFormValues> }) {
  const { mutate, isPending } = useUpsertEngineer();
  const form = useForm<EngineerFormValues>({
    resolver: zodResolver(engineerSchema),
    defaultValues: {
      fullName: initial?.fullName ?? "",
      naCode: initial?.naCode ?? "",
      cellPhone: initial?.cellPhone ?? "",
      email: initial?.email ?? "",
      sectionId: initial?.sectionId ?? undefined,
    },
  });

  function onSubmit(values: EngineerFormValues) {
    mutate(values, {
      onSuccess: () => toast.success("مهندس با موفقیت ذخیره شد"),
      onError: (e) => toast.error(String(e)),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="fullName" render={({ field }) => (
          <FormItem>
            <FormLabel>نام و نام خانوادگی</FormLabel>
            <FormControl><Input placeholder="نام کامل" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        {/* ... more fields */}
        <Button type="submit" disabled={isPending}>
          {isPending ? "در حال ذخیره..." : "ذخیره"}
        </Button>
      </form>
    </Form>
  );
}
```

---

## Redux Slice Migration Checklist

| Slice | Hook | Status |
|---|---|---|
| `ElectProjects` | `use-projects.ts` | 🔲 |
| `Engineers` | `use-engineers.ts` | 🔲 |
| `USERs` | `use-users.ts` | 🔲 |
| `Accounting` | `use-accounting.ts` | 🔲 |
| `ElectProjectProcesses` | `use-epp.ts` | 🔲 |
| `Supports` | `use-support.ts` | 🔲 |
| `Payment` | `use-payment.ts` | 🔲 |
| `QuarterTariff` | `use-tariffs.ts` | 🔲 |
| `EngPayment` | `use-eng-payment.ts` | 🔲 |
| `Quotas` | `use-quotas.ts` | 🔲 |
| `Login` / `Profile` | Supabase Auth | 🔲 |
| `Layout` | Zustand `useUIStore` | 🔲 |
| `Commons` | `use-files.ts` | 🔲 |
| `AppMenus` | Static `src/config/nav.ts` | 🔲 |
| `calendar` | TanStack Query | 🔲 |
| `channels` | TanStack Query | 🔲 |
| `Account` / `ForgetPassword` | Supabase Auth | 🔲 |
| `ReqRegister` | Deprecated (invite-only) | — |
| `ChangePassword` | Supabase Auth | 🔲 |
| `RequestDemo` | Simple Server Action | 🔲 |
