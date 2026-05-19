import { documents as seedDocuments } from "@/data/documents";
import type { Document, DocumentFilters } from "@/types";

const store: Document[] = [...seedDocuments];

export const mockDocumentService = {
  async getAll(filters?: DocumentFilters): Promise<Document[]> {
    let result = [...store];

    if (filters?.category) {
      result = result.filter((d) => d.category === filters.category);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (filters?.sortBy === "downloads") {
      result.sort((a, b) => b.downloadCount - a.downloadCount);
    } else if (filters?.sortBy === "name") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  },

  async getById(id: string): Promise<Document | null> {
    return store.find((d) => d.id === id) ?? null;
  },

  async getFeatured(): Promise<Document[]> {
    return store.filter((d) => d.featured);
  },

  async getByCategory(category: string): Promise<Document[]> {
    return store.filter((d) => d.category === category);
  },

  async getCategories(): Promise<{ name: string; count: number }[]> {
    const cats = new Map<string, number>();
    store.forEach((d) => { cats.set(d.category, (cats.get(d.category) ?? 0) + 1); });
    return Array.from(cats.entries()).map(([name, count]) => ({ name, count }));
  },

  async create(data: Omit<Document, "id" | "date">): Promise<Document> {
    const item: Document = { ...data, id: Date.now().toString(), date: new Date().toISOString() };
    store.unshift(item);
    return item;
  },

  async update(id: string, data: Partial<Document>): Promise<Document> {
    const idx = store.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error("not found");
    store[idx] = { ...store[idx], ...data };
    return store[idx];
  },

  async delete(id: string): Promise<void> {
    const idx = store.findIndex((d) => d.id === id);
    if (idx !== -1) store.splice(idx, 1);
  },

  async incrementDownload(id: string): Promise<void> {
    const idx = store.findIndex((d) => d.id === id);
    if (idx !== -1) store[idx].downloadCount += 1;
  },
};

export default mockDocumentService;
