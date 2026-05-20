import { createClient } from "@supabase/supabase-js";
import type { Document, DocumentFilters } from "@/types";

function getClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

function rowToDocument(row: Record<string, unknown>): Document {
  return {
    id: row.id as string,
    title: row.title as string,
    category: (row.category as Document["category"]) ?? "فرم اجرایی",
    date: (row.created_at as string) ?? "",
    jalaliDate: (row.jalali_date as string) ?? "",
    version: (row.version as string) ?? "1.0",
    description: (row.description as string) ?? "",
    fileSize: (row.file_size as string) ?? "",
    downloadCount: (row.download_count as number) ?? 0,
    tags: (row.tags as string[]) ?? [],
    fileUrl: (row.file_url as string) ?? undefined,
    featured: (row.featured as boolean) ?? false,
  };
}

export const supabaseDocumentService = {
  async getAll(filters?: DocumentFilters): Promise<Document[]> {
    const client = getClient();
    let query = client.from("documents").select("*").order("created_at", { ascending: false });

    if (filters?.category) query = query.eq("category", filters.category);
    if (filters?.search) query = query.ilike("title", `%${filters.search}%`);
    if (filters?.sortBy === "downloads") query = query.order("download_count", { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(rowToDocument);
  },

  async getById(id: string): Promise<Document | null> {
    const client = getClient();
    const { data, error } = await client.from("documents").select("*").eq("id", id).single();
    if (error) return null;
    return rowToDocument(data);
  },

  async getFeatured(): Promise<Document[]> {
    const client = getClient();
    const { data } = await client.from("documents").select("*").eq("featured", true).order("created_at", { ascending: false });
    return (data ?? []).map(rowToDocument);
  },

  async getByCategory(category: string): Promise<Document[]> {
    const client = getClient();
    const { data } = await client.from("documents").select("*").eq("category", category).order("created_at", { ascending: false });
    return (data ?? []).map(rowToDocument);
  },

  async getCategories(): Promise<{ name: string; count: number }[]> {
    const client = getClient();
    const { data } = await client.from("documents").select("category");
    const cats = new Map<string, number>();
    (data ?? []).forEach((r) => {
      const cat = r.category as string;
      cats.set(cat, (cats.get(cat) ?? 0) + 1);
    });
    return Array.from(cats.entries()).map(([name, count]) => ({ name, count }));
  },

  async create(data: Omit<Document, "id" | "date">): Promise<Document> {
    const client = getClient();
    const { data: row, error } = await client
      .from("documents")
      .insert({
        title: data.title,
        category: data.category,
        jalali_date: data.jalaliDate,
        version: data.version,
        description: data.description,
        file_size: data.fileSize,
        download_count: data.downloadCount ?? 0,
        tags: data.tags,
        file_url: data.fileUrl,
        featured: data.featured,
      })
      .select()
      .single();
    if (error) throw error;
    return rowToDocument(row);
  },

  async update(id: string, data: Partial<Document>): Promise<Document> {
    const client = getClient();
    const { data: row, error } = await client
      .from("documents")
      .update({
        ...(data.title !== undefined && { title: data.title }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.jalaliDate !== undefined && { jalali_date: data.jalaliDate }),
        ...(data.version !== undefined && { version: data.version }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.fileSize !== undefined && { file_size: data.fileSize }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.fileUrl !== undefined && { file_url: data.fileUrl }),
        ...(data.featured !== undefined && { featured: data.featured }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return rowToDocument(row);
  },

  async delete(id: string): Promise<void> {
    const client = getClient();
    const { error } = await client.from("documents").delete().eq("id", id);
    if (error) throw error;
  },

  async incrementDownload(id: string): Promise<void> {
    const client = getClient();
    await client.rpc("increment_download", { doc_id: id }).maybeSingle();
  },
};

export default supabaseDocumentService;
