import { createClient } from "@supabase/supabase-js";
import type { Announcement, AnnouncementFilters } from "@/types";

function getClient() {
  // Use SUPABASE_URL (runtime, no NEXT_PUBLIC_ prefix) so Docker can inject the
  // internal supabase-kong address without it being baked at build time.
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

function rowToAnnouncement(row: Record<string, unknown>): Announcement {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    excerpt: (row.excerpt as string) ?? "",
    content: (row.content as string) ?? "",
    category: (row.category as string) ?? "",
    priority: (row.priority as Announcement["priority"]) ?? "info",
    jalaliDate: (row.jalali_date as string) ?? "",
    publishedAt: (row.published_at as string) ?? "",
    featured: (row.featured as boolean) ?? false,
  };
}

export const supabaseAnnouncementService = {
  async getAll(filters?: AnnouncementFilters): Promise<Announcement[]> {
    const client = getClient();
    let query = client.from("announcements").select("*").order("published_at", { ascending: false });

    if (filters?.priority) query = query.eq("priority", filters.priority);
    if (filters?.search) query = query.ilike("title", `%${filters.search}%`);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(rowToAnnouncement);
  },

  async getById(id: string): Promise<Announcement | null> {
    const client = getClient();
    const { data, error } = await client
      .from("announcements")
      .select("*")
      .or(`id.eq.${id},slug.eq.${id}`)
      .single();
    if (error) return null;
    return rowToAnnouncement(data);
  },

  async getFeatured(): Promise<Announcement[]> {
    const client = getClient();
    const { data } = await client.from("announcements").select("*").eq("featured", true).order("published_at", { ascending: false });
    return (data ?? []).map(rowToAnnouncement);
  },

  async getUrgent(): Promise<Announcement[]> {
    const client = getClient();
    const { data } = await client.from("announcements").select("*").eq("priority", "urgent").order("published_at", { ascending: false });
    return (data ?? []).map(rowToAnnouncement);
  },

  async getLatest(count = 4): Promise<Announcement[]> {
    const client = getClient();
    const { data } = await client.from("announcements").select("*").order("published_at", { ascending: false }).limit(count);
    return (data ?? []).map(rowToAnnouncement);
  },

  async create(data: Omit<Announcement, "id">): Promise<Announcement> {
    const client = getClient();
    const { data: row, error } = await client
      .from("announcements")
      .insert({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        priority: data.priority,
        jalali_date: data.jalaliDate,
        featured: data.featured,
        published_at: data.publishedAt || new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return rowToAnnouncement(row);
  },

  async update(id: string, data: Partial<Announcement>): Promise<Announcement> {
    const client = getClient();
    const { data: row, error } = await client
      .from("announcements")
      .update({
        ...(data.title && { title: data.title }),
        ...(data.slug && { slug: data.slug }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.priority && { priority: data.priority }),
        ...(data.jalaliDate !== undefined && { jalali_date: data.jalaliDate }),
        ...(data.featured !== undefined && { featured: data.featured }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return rowToAnnouncement(row);
  },

  async delete(id: string): Promise<void> {
    const client = getClient();
    const { error } = await client.from("announcements").delete().eq("id", id);
    if (error) throw error;
  },
};

export default supabaseAnnouncementService;
