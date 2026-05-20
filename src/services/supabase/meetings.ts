import { createClient } from "@supabase/supabase-js";
import type { Meeting, MeetingFilters, Resolution } from "@/types";

function getClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

function rowToMeeting(row: Record<string, unknown>): Meeting {
  return {
    id: row.id as string,
    sessionNumber: (row.session_number as number) ?? 0,
    subject: (row.subject as string) ?? "",
    jalaliDate: (row.jalali_date as string) ?? "",
    date: (row.created_at as string) ?? "",
    status: (row.status as Meeting["status"]) ?? "برگزار شده",
    type: (row.type as Meeting["type"]) ?? "هیئت رئیسه",
    pdfUrl: (row.pdf_url as string) ?? undefined,
    resolutions: (row.resolutions as Resolution[]) ?? [],
    attendees: (row.attendees as string[]) ?? undefined,
    notes: (row.notes as string) ?? undefined,
  };
}

export const supabaseMeetingService = {
  async getAll(filters?: MeetingFilters): Promise<Meeting[]> {
    const client = getClient();
    let query = client.from("meetings").select("*").order("session_number", { ascending: false });

    if (filters?.type) query = query.eq("type", filters.type);
    if (filters?.status) query = query.eq("status", filters.status);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(rowToMeeting);
  },

  async getById(id: string): Promise<Meeting | null> {
    const client = getClient();
    const { data, error } = await client.from("meetings").select("*").eq("id", id).single();
    if (error) return null;
    return rowToMeeting(data);
  },

  async getLatest(count = 5): Promise<Meeting[]> {
    const client = getClient();
    const { data } = await client.from("meetings").select("*").order("session_number", { ascending: false }).limit(count);
    return (data ?? []).map(rowToMeeting);
  },

  async create(data: Omit<Meeting, "id" | "date">): Promise<Meeting> {
    const client = getClient();
    const { data: row, error } = await client
      .from("meetings")
      .insert({
        session_number: data.sessionNumber,
        subject: data.subject,
        jalali_date: data.jalaliDate,
        status: data.status,
        type: data.type,
        pdf_url: data.pdfUrl,
        resolutions: data.resolutions,
        attendees: data.attendees,
        notes: data.notes,
      })
      .select()
      .single();
    if (error) throw error;
    return rowToMeeting(row);
  },

  async update(id: string, data: Partial<Meeting>): Promise<Meeting> {
    const client = getClient();
    const { data: row, error } = await client
      .from("meetings")
      .update({
        ...(data.sessionNumber !== undefined && { session_number: data.sessionNumber }),
        ...(data.subject !== undefined && { subject: data.subject }),
        ...(data.jalaliDate !== undefined && { jalali_date: data.jalaliDate }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.pdfUrl !== undefined && { pdf_url: data.pdfUrl }),
        ...(data.resolutions !== undefined && { resolutions: data.resolutions }),
        ...(data.attendees !== undefined && { attendees: data.attendees }),
        ...(data.notes !== undefined && { notes: data.notes }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return rowToMeeting(row);
  },

  async delete(id: string): Promise<void> {
    const client = getClient();
    const { error } = await client.from("meetings").delete().eq("id", id);
    if (error) throw error;
  },
};

export default supabaseMeetingService;
