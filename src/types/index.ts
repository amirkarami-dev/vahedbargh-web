export * from "./announcement";
export * from "./meeting";
export * from "./document";

export interface StatItem {
  value: number;
  label: string;
  suffix: string;
  icon: string;
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
