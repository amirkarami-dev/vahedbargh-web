import { announcements } from "@/data/announcements";
import type { Announcement, AnnouncementFilters } from "@/types";

export const mockAnnouncementService = {
  async getAll(filters?: AnnouncementFilters): Promise<Announcement[]> {
    let result = [...announcements];

    if (filters?.priority) {
      result = result.filter((a) => a.priority === filters.priority);
    }
    if (filters?.category) {
      result = result.filter((a) => a.category === filters.category);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q)
      );
    }

    return result;
  },

  async getById(id: string): Promise<Announcement | null> {
    return announcements.find((a) => a.id === id || a.slug === id) ?? null;
  },

  async getFeatured(): Promise<Announcement[]> {
    return announcements.filter((a) => a.featured);
  },

  async getUrgent(): Promise<Announcement[]> {
    return announcements.filter((a) => a.priority === "urgent");
  },

  async getLatest(count = 4): Promise<Announcement[]> {
    return announcements.slice(0, count);
  },
};

export default mockAnnouncementService;
