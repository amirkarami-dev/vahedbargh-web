import { announcements as seedAnnouncements } from "@/data/announcements";
import type { Announcement, AnnouncementFilters } from "@/types";

const store: Announcement[] = [...seedAnnouncements];

export const mockAnnouncementService = {
  async getAll(filters?: AnnouncementFilters): Promise<Announcement[]> {
    let result = [...store];

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
    return store.find((a) => a.id === id || a.slug === id) ?? null;
  },

  async getFeatured(): Promise<Announcement[]> {
    return store.filter((a) => a.featured);
  },

  async getUrgent(): Promise<Announcement[]> {
    return store.filter((a) => a.priority === "urgent");
  },

  async getLatest(count = 4): Promise<Announcement[]> {
    return store.slice(0, count);
  },

  async create(data: Omit<Announcement, "id">): Promise<Announcement> {
    const item: Announcement = { ...data, id: Date.now().toString() };
    store.unshift(item);
    return item;
  },

  async update(id: string, data: Partial<Announcement>): Promise<Announcement> {
    const idx = store.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("not found");
    store[idx] = { ...store[idx], ...data };
    return store[idx];
  },

  async delete(id: string): Promise<void> {
    const idx = store.findIndex((a) => a.id === id);
    if (idx !== -1) store.splice(idx, 1);
  },
};

export default mockAnnouncementService;
