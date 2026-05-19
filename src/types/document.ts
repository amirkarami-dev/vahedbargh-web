export type DocumentCategory =
  | "نظام‌نامه"
  | "دستورالعمل"
  | "تعرفه"
  | "فرم اجرایی"
  | "بخشنامه"
  | "چک‌لیست"
  | "مقررات ملی ساختمان";

export interface Document {
  id: string;
  title: string;
  category: DocumentCategory;
  date: string;
  jalaliDate: string;
  version: string;
  description: string;
  fileSize: string;
  downloadCount: number;
  tags: string[];
  fileUrl?: string;
  featured?: boolean;
}

export interface DocumentFilters {
  category?: DocumentCategory;
  search?: string;
  sortBy?: "date" | "name" | "category" | "downloads";
}

export interface EarthElectrodeTariff {
  id: number;
  method: string;
  price: number;
  unit: string;
}
