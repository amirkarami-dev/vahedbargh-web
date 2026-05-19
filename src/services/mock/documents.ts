import { documents } from "@/data/documents";
import type { Document, DocumentFilters } from "@/types";

export const mockDocumentService = {
  async getAll(filters?: DocumentFilters): Promise<Document[]> {
    let result = [...documents];

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
    return documents.find((d) => d.id === id) ?? null;
  },

  async getFeatured(): Promise<Document[]> {
    return documents.filter((d) => d.featured);
  },

  async getByCategory(category: string): Promise<Document[]> {
    return documents.filter((d) => d.category === category);
  },

  async getCategories(): Promise<{ name: string; count: number }[]> {
    const cats = new Map<string, number>();
    documents.forEach((d) => {
      cats.set(d.category, (cats.get(d.category) ?? 0) + 1);
    });
    return Array.from(cats.entries()).map(([name, count]) => ({ name, count }));
  },
};

export default mockDocumentService;
