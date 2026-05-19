export type AnnouncementPriority = "urgent" | "important" | "info";

export interface Announcement {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  priority: AnnouncementPriority;
  jalaliDate: string;
  publishedAt: string;
  imageUrl?: string;
  featured: boolean;
}

export interface AnnouncementFilters {
  priority?: AnnouncementPriority;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}
