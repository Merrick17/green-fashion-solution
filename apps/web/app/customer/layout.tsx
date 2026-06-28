'use client';
import {
  LayoutDashboard,
  FolderKanban,
  Palette,
  FileText,
  Sparkles,
  Calendar,
  MessageSquare,
  Settings,
  Bell,
} from 'lucide-react';
import { PortalShell } from '@/components/shell/portal-shell';
import type { PortalConfig } from '@/components/shell/types';
const basePath = '/customer';
const portal: PortalConfig = {
  basePath,
  label: 'Collection workspace',
  brand: 'Green Fashion Solution',
  variant: 'customer',
  sidebarDescription:
    'Develop your collection with your sourcing team. Review proposals and track production.',
  navGroups: [
    {
      items: [
        {
          href: `${basePath}/dashboard`,
          label: 'Collections',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: 'Development',
      items: [
        {
          href: `${basePath}/projects`,
          label: 'Workspaces',
          icon: FolderKanban,
        },
        {
          href: `${basePath}/inspiration`,
          label: 'Inspiration',
          icon: Sparkles,
        },
        { href: `${basePath}/moodboard`, label: 'Moodboards', icon: Palette },
        {
          href: `${basePath}/proposals`,
          label: 'Presentations',
          icon: FileText,
        },
      ],
    },
    {
      label: 'Execution',
      items: [
        { href: `${basePath}/calendar`, label: 'Calendar', icon: Calendar },
        {
          href: `${basePath}/messages`,
          label: 'Messages',
          icon: MessageSquare,
        },
        {
          href: `${basePath}/notifications`,
          label: 'Notifications',
          icon: Bell,
        },
      ],
    },
    {
      items: [
        { href: `${basePath}/settings`, label: 'Settings', icon: Settings },
      ],
    },
  ],
};
export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShell
      portal={portal}
      settingsHref={`${basePath}/settings`}
      avatarFallback="C"
      fullBleedRoutes={[/^\/customer\/moodboard\/[^/]+$/]}
    >
      {children}
    </PortalShell>
  );
}
