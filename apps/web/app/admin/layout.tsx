'use client';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  ListTodo,
  Calendar,
  UserCog,
  UserPlus,
  Users,
  Mail,
  Clock,
  LayoutGrid,
  Sparkles,
  FolderOpen,
  Shield,
  Settings,
  Tags,
  Bell,
  BarChart2,
  TrendingUp,
} from 'lucide-react';
import { PortalShell } from '@/components/shell/portal-shell';
import type { PortalConfig } from '@/components/shell/types';
const basePath = '/admin';
const portal: PortalConfig = {
  basePath,
  label: 'Orchestration',
  brand: 'Green Fashion Solution',
  variant: 'admin',
  sidebarDescription:
    'Build proposals, coordinate research, and guide collections to production.',
  navGroups: [
    {
      label: 'Work',
      items: [
        {
          href: `${basePath}/proposals`,
          label: 'Proposal Builder',
          icon: FileText,
        },
        {
          href: `${basePath}/dashboard`,
          label: 'Overview',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: 'Collections',
      items: [
        { href: `${basePath}/projects`, label: 'Projects', icon: FolderKanban },
      ],
    },
    {
      label: 'Sourcing Library',
      items: [
        {
          href: `${basePath}/moodboards`,
          label: 'Moodboards',
          icon: LayoutGrid,
        },
        {
          href: `${basePath}/inspiration`,
          label: 'Inspiration',
          icon: Sparkles,
        },
        { href: `${basePath}/files`, label: 'Files', icon: FolderOpen },
      ],
    },
    {
      label: 'Operations',
      items: [
        { href: `${basePath}/tasks`, label: 'Briefs', icon: ListTodo },
        { href: `${basePath}/designers`, label: 'Designers', icon: Users },
        { href: `${basePath}/calendar`, label: 'Calendar', icon: Calendar },
        {
          href: `${basePath}/notifications`,
          label: 'Notifications',
          icon: Bell,
        },
      ],
    },
    {
      label: 'People & Intake',
      items: [
        { href: `${basePath}/users`, label: 'Users', icon: UserCog },
        {
          href: `${basePath}/designer-applications`,
          label: 'Applications',
          icon: UserPlus,
        },
        { href: `${basePath}/acquisition`, label: 'Acquisition', icon: TrendingUp },
        { href: `${basePath}/leads`, label: 'Leads', icon: Mail },
        { href: `${basePath}/waitlist`, label: 'Waitlist', icon: Clock },
      ],
    },
    {
      label: 'System',
      items: [
        { href: `${basePath}/analytics`, label: 'Analytics', icon: BarChart2 },
        { href: `${basePath}/brief-options`, label: 'Categories', icon: Tags },
        { href: `${basePath}/audit`, label: 'Audit', icon: Shield },
        { href: `${basePath}/settings`, label: 'Settings', icon: Settings },
      ],
    },
  ],
};
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShell
      portal={portal}
      settingsHref={`${basePath}/settings`}
      avatarFallback="A"
      fullBleedRoutes={[
        /^\/admin\/proposals\/new$/,
        /^\/admin\/proposals\/[^/]+$/,
      ]}
    >
      {children}
    </PortalShell>
  );
}
