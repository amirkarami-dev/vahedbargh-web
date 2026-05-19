import { meetings } from "@/data/meetings";
import type { Meeting, MeetingFilters } from "@/types";

export const mockMeetingService = {
  async getAll(filters?: MeetingFilters): Promise<Meeting[]> {
    let result = [...meetings];

    if (filters?.type) {
      result = result.filter((m) => m.type === filters.type);
    }
    if (filters?.status) {
      result = result.filter((m) => m.status === filters.status);
    }

    return result;
  },

  async getById(id: string): Promise<Meeting | null> {
    return meetings.find((m) => m.id === id) ?? null;
  },

  async getLatest(count = 5): Promise<Meeting[]> {
    return meetings.slice(0, count);
  },
};

export default mockMeetingService;
