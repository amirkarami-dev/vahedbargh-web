# Support / Ticketing Module Spec

---

## Pages

| Route | Role | Description |
|---|---|---|
| `/admin/support` | All | Ticket list (filtered by role) |
| `/admin/support/new` | All | Create new ticket |
| `/admin/support/[id]` | All | Ticket thread + file attachments |

---

## Ticket Flow

```
User creates ticket (title, description, file attachment optional)
  ↓
Admin/Employee assigned (to_user_id)
  ↓
Thread of messages (support_messages)
  ↓
Admin/Accountant/Employee closes ticket
```

---

## Real-time Updates

```typescript
// Supabase Realtime subscription for new ticket messages
import { createBrowserClient } from "@supabase/ssr";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useSupportRealtime(supportId: string) {
  const qc = useQueryClient();
  const supabase = createBrowserClient(/* ... */);

  useEffect(() => {
    const channel = supabase
      .channel(`support:${supportId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages", filter: `support_id=eq.${supportId}` },
        () => qc.invalidateQueries({ queryKey: ["tickets", supportId] })
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supportId]);
}
```

---

## Server Actions

```typescript
// app/admin/support/actions.ts

export async function getSupports(filter: SupportFilter) {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  let query = supabase
    .from("supports")
    .select("*, support_messages(count)")
    .eq("closed", false);

  // Engineers and users only see their own tickets
  if (!["Administrator", "Employee", "Accountant"].includes(user.role)) {
    query = query.or(`user_id.eq.${user.id},to_user_id.eq.${user.id}`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createTicket(supportId: string, message: string, files?: File[]) {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  await supabase.from("support_messages").insert({
    support_id: supportId,
    user_id: user.id,
    message,
  });

  if (files?.length) {
    for (const file of files) {
      const path = `${supportId}/${Date.now()}-${file.name}`;
      await supabase.storage.from("support-files").upload(path, file);
      await supabase.from("support_files").insert({
        support_id: supportId,
        storage_path: path,
        name: file.name,
      });
    }
  }

  revalidatePath(`/admin/support/${supportId}`);
}

export async function closeSupport(supportId: string) {
  const supabase = await getSupabaseClient();
  await supabase.from("supports").update({ closed: true }).eq("id", supportId);
  revalidatePath("/admin/support");
}
```
