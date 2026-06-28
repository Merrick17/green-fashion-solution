'use client';
import {
  LayoutDashboard,
  ListTodo,
  Layers,
  Shirt,
  Package,
  Calendar,
  Settings,
} from 'lucide-react';
import { PortalShell } from '@/components/shell/portal-shell';
import type { PortalConfig } from '@/components/shell/types';
const basePath = '/designer';
const portal: PortalConfig = {
  basePath,
  label: 'Sourcing archive',
  brand: 'Green Fashion Solution',
  variant: 'designer',
  sidebarDescription:
    'Curate fabrics, references, and collections for internal sourcing.',
  navGroups: [
    {
      items: [
        {
          href: `${basePath}/dashboard`,
          label: 'Overview',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: 'Contributions',
      items: [{ href: `${basePath}/briefs`, label: 'Briefs', icon: ListTodo }],
    },
    {
      label: 'Archive',
      items: [
        { href: `${basePath}/collections`, label: 'Collections', icon: Layers },
        { href: `${basePath}/assets/fabrics`, label: 'Fabrics', icon: Shirt },
        {
          href: `${basePath}/assets/products`,
          label: 'References',
          icon: Package,
        },
      ],
    },
    {
      label: 'Schedule',
      items: [
        { href: `${basePath}/calendar`, label: 'Calendar', icon: Calendar },
      ],
    },
    {
      items: [
        { href: `${basePath}/settings`, label: 'Settings', icon: Settings },
      ],
    },
  ],
};
export default function DesignerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShell
      portal={portal}
      settingsHref={`${basePath}/settings`}
      avatarFallback="D"
    >
      {children}
    </PortalShell>
  );
}
