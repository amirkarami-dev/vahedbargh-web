export * from "./announcement";
export * from "./meeting";
export * from "./document";

export interface StatItem {
  id: string;
  label: string;
  value: number;
  suffix: string;
  iconName: string;
  sortOrder: number;
}

export interface ServiceItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
}
