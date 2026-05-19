// Supabase implementation — activate via NEXT_PUBLIC_DATA_PROVIDER=supabase
import type { Announcement, AnnouncementFilters } from "@/types";

export const supabaseAnnouncementService = {
  async getAll(_filters?: AnnouncementFilters): Promise<Announcement[]> {
    throw new Error("Supabase provider not yet configured");
  },
  async getById(_id: string): Promise<Announcement | null> {
    throw new Error("Supabase provider not yet configured");
  },
  async getFeatured(): Promise<Announcement[]> {
    throw new Error("Supabase provider not yet configured");
  },
  async getUrgent(): Promise<Announcement[]> {
    throw new Error("Supabase provider not yet configured");
  },
  async getLatest(_count?: number): Promise<Announcement[]> {
    throw new Error("Supabase provider not yet configured");
  },
};

export default supabaseAnnouncementService;
