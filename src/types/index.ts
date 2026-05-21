export * from "./announcement";
export * from "./meeting";
export * from "./document";
export * from "./enums";
export * from "./geo";
export * from "./user";
export * from "./engineer";
export * from "./project";
export * from "./accounting";
export * from "./support";

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
