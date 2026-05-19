import { meetings as seedMeetings } from "@/data/meetings";
import type { Meeting, MeetingFilters } from "@/types";

const store: Meeting[] = [...seedMeetings];

export const mockMeetingService = {
  async getAll(filters?: MeetingFilters): Promise<Meeting[]> {
    let result = [...store];
    if (filters?.type) result = result.filter((m) => m.type === filters.type);
    if (filters?.status) result = result.filter((m) => m.status === filters.status);
    return result;
  },

  async getById(id: string): Promise<Meeting | null> {
    return store.find((m) => m.id === id) ?? null;
  },

  async getLatest(count = 5): Promise<Meeting[]> {
    return store.slice(0, count);
  },

  async create(data: Omit<Meeting, "id" | "date">): Promise<Meeting> {
    const item: Meeting = { ...data, id: Date.now().toString(), date: new Date().toISOString() };
    store.unshift(item);
    return item;
  },

  async update(id: string, data: Partial<Meeting>): Promise<Meeting> {
    const idx = store.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error("not found");
    store[idx] = { ...store[idx], ...data };
    return store[idx];
  },

  async delete(id: string): Promise<void> {
    const idx = store.findIndex((m) => m.id === id);
    if (idx !== -1) store.splice(idx, 1);
  },
};

export default mockMeetingService;
