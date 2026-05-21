// ─── Geographic Lookup Types ───────────────────────────────────────────────────

export interface Province {
  id: number;
  name: string;
}

export interface City {
  id: number;
  name: string;
  provinceId: number;
}

export interface Section {
  id: number;
  sectionName: string;
  cityId: number;
}
