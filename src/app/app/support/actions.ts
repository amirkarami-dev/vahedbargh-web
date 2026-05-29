"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string | null;
  created_by: string | null;
  assigned_to: string | null;
  client_id: string | null;
  created_at: string;
  updated_at: string | null;
  /** Joined from profiles */
  creator_name?: string | null;
}

export interface SupportReply {
  id: string;
  ticket_id: string;
  message: string;
  created_by: string | null;
  created_at: string;
  is_internal: boolean;
  /** Joined from profiles */
  author_name?: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getField(formData: FormData, name: string): string {
  const direct = formData.get(name);
  if (direct != null) return direct as string;
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && key.replace(/^_\d+_/, "") === name) {
      return value;
    }
  }
  return "";
}

// ─── Data fetch helpers (called from Server Components) ───────────────────────

export async function getTickets(filter?: {
  status?: string;
  onlyMine?: boolean;
}): Promise<{ tickets: SupportTicket[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    let query = supabase
      .from("support_tickets")
      .select(
        "id, title, description, status, priority, category, created_by, assigned_to, client_id, created_at, updated_at, profiles!support_tickets_created_by_fkey(first_name, last_name)"
      )
      .order("created_at", { ascending: false });

    if (filter?.onlyMine) {
      query = query.eq("created_by", user.id);
    }

    if (
      filter?.status &&
      filter.status !== "all" &&
      filter.status !== "همه"
    ) {
      query = query.eq("status", filter.status);
    }

    const { data, error } = await query;
    if (error) {
      // Table likely doesn't exist yet
      return { tickets: [], error: error.message };
    }

    const tickets: SupportTicket[] = (data ?? []).map((row) => {
      const profile = (row.profiles as unknown) as
        | { first_name: string | null; last_name: string | null }
        | null
        | undefined;
      return {
        id: row.id as string,
        title: row.title as string,
        description: row.description as string,
        status: (row.status as TicketStatus) ?? "open",
        priority: (row.priority as TicketPriority) ?? "normal",
        category: row.category as string | null,
        created_by: row.created_by as string | null,
        assigned_to: row.assigned_to as string | null,
        client_id: row.client_id as string | null,
        created_at: row.created_at as string,
        updated_at: row.updated_at as string | null,
        creator_name: profile
          ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ||
            null
          : null,
      };
    });

    return { tickets, error: null };
  } catch (err) {
    return {
      tickets: [],
      error: err instanceof Error ? err.message : "خطای ناشناخته",
    };
  }
}

export async function getTicketById(id: string): Promise<{
  ticket: SupportTicket | null;
  replies: SupportReply[];
  error: string | null;
  currentUserId: string | null;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const [ticketRes, repliesRes] = await Promise.all([
      supabase
        .from("support_tickets")
        .select(
          "id, title, description, status, priority, category, created_by, assigned_to, client_id, created_at, updated_at, profiles!support_tickets_created_by_fkey(first_name, last_name)"
        )
        .eq("id", id)
        .single(),
      supabase
        .from("support_replies")
        .select(
          "id, ticket_id, message, created_by, created_at, is_internal, profiles!support_replies_created_by_fkey(first_name, last_name)"
        )
        .eq("ticket_id", id)
        .order("created_at", { ascending: true }),
    ]);

    if (ticketRes.error || !ticketRes.data) {
      return {
        ticket: null,
        replies: [],
        error: ticketRes.error?.message ?? "تیکت یافت نشد",
        currentUserId: user.id,
      };
    }

    const row = ticketRes.data;
    const profile = (row.profiles as unknown) as
      | { first_name: string | null; last_name: string | null }
      | null
      | undefined;

    const ticket: SupportTicket = {
      id: row.id as string,
      title: row.title as string,
      description: row.description as string,
      status: (row.status as TicketStatus) ?? "open",
      priority: (row.priority as TicketPriority) ?? "normal",
      category: row.category as string | null,
      created_by: row.created_by as string | null,
      assigned_to: row.assigned_to as string | null,
      client_id: row.client_id as string | null,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string | null,
      creator_name: profile
        ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ||
          null
        : null,
    };

    const replies: SupportReply[] = (repliesRes.data ?? []).map((r) => {
      const rProfile = (r.profiles as unknown) as
        | { first_name: string | null; last_name: string | null }
        | null
        | undefined;
      return {
        id: r.id as string,
        ticket_id: r.ticket_id as string,
        message: r.message as string,
        created_by: r.created_by as string | null,
        created_at: r.created_at as string,
        is_internal: (r.is_internal as boolean) ?? false,
        author_name: rProfile
          ? `${rProfile.first_name ?? ""} ${rProfile.last_name ?? ""}`.trim() ||
            null
          : null,
      };
    });

    return { ticket, replies, error: null, currentUserId: user.id };
  } catch (err) {
    return {
      ticket: null,
      replies: [],
      error: err instanceof Error ? err.message : "خطای ناشناخته",
      currentUserId: null,
    };
  }
}

// ─── Server Actions ───────────────────────────────────────────────────────────

export async function createTicket(
  formData: FormData
): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "احراز هویت انجام نشده است" };

    const title = getField(formData, "title").trim();
    const description = getField(formData, "description").trim();
    const category = getField(formData, "category").trim() || null;
    const priority =
      (getField(formData, "priority").trim() as TicketPriority) || "normal";

    if (!title) return { ok: false, error: "عنوان تیکت اجباری است" };
    if (!description) return { ok: false, error: "توضیحات تیکت اجباری است" };

    const { data, error } = await supabase
      .from("support_tickets")
      .insert({
        title,
        description,
        category,
        priority,
        status: "open",
        created_by: user.id,
      })
      .select("id")
      .single();

    if (error) return { ok: false, error: error.message };

    revalidatePath("/app/support");
    return { ok: true, id: data.id as string };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "خطای ناشناخته",
    };
  }
}

export async function replyToTicket(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "احراز هویت انجام نشده است" };

    const ticketId = getField(formData, "ticketId").trim();
    const message = getField(formData, "message").trim();

    if (!ticketId) return { ok: false, error: "شناسه تیکت یافت نشد" };
    if (!message) return { ok: false, error: "متن پیام اجباری است" };

    const { error } = await supabase.from("support_replies").insert({
      ticket_id: ticketId,
      message,
      created_by: user.id,
      is_internal: false,
    });

    if (error) return { ok: false, error: error.message };

    // Also update updated_at on the ticket
    await supabase
      .from("support_tickets")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", ticketId);

    revalidatePath(`/app/support/${ticketId}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "خطای ناشناخته",
    };
  }
}

export async function closeTicket(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "احراز هویت انجام نشده است" };

    const { error } = await supabase
      .from("support_tickets")
      .update({ status: "closed", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { ok: false, error: error.message };

    revalidatePath("/app/support");
    revalidatePath(`/app/support/${id}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "خطای ناشناخته",
    };
  }
}

export async function updateTicketStatus(
  id: string,
  status: TicketStatus
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "احراز هویت انجام نشده است" };

    const { error } = await supabase
      .from("support_tickets")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { ok: false, error: error.message };

    revalidatePath("/app/support");
    revalidatePath(`/app/support/${id}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "خطای ناشناخته",
    };
  }
}
