import type { Meeting, MeetingFilters } from "@/types";

export const supabaseMeetingService = {
  async getAll(_filters?: MeetingFilters): Promise<Meeting[]> {
    throw new Error("Supabase provider not yet configured");
  },
  async getById(_id: string): Promise<Meeting | null> {
    throw new Error("Supabase provider not yet configured");
  },
  async getLatest(_count?: number): Promise<Meeting[]> {
    throw new Error("Supabase provider not yet configured");
  },
};

export default supabaseMeetingService;
