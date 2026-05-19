import type { Document, DocumentFilters } from "@/types";

export const supabaseDocumentService = {
  async getAll(_filters?: DocumentFilters): Promise<Document[]> {
    throw new Error("Supabase provider not yet configured");
  },
  async getById(_id: string): Promise<Document | null> {
    throw new Error("Supabase provider not yet configured");
  },
  async getFeatured(): Promise<Document[]> {
    throw new Error("Supabase provider not yet configured");
  },
  async getByCategory(_category: string): Promise<Document[]> {
    throw new Error("Supabase provider not yet configured");
  },
  async getCategories(): Promise<{ name: string; count: number }[]> {
    throw new Error("Supabase provider not yet configured");
  },
};

export default supabaseDocumentService;
