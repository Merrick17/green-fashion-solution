import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export type PortalVariant = 'default' | 'customer' | 'admin' | 'designer';

export interface PortalConfig {
  basePath: string;
  label: string;
  brand: string;
  navGroups: NavGroup[];
  variant?: PortalVariant;
  sidebarDescription?: string;
}
