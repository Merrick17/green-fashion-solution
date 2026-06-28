'use client';
import Link from 'next/link';
import { Calendar, Palette, Plus, Sparkles } from 'lucide-react';
import { useActiveProjectHref } from '@/hooks/use-active-project';
const shortcuts = [
  {
    href: '/customer/projects/new',
    label: 'New brief',
    icon: Plus,
    desc: 'Start a collection',
  },
  {
    href: '/customer/moodboard',
    label: 'Moodboard',
    icon: Palette,
    desc: 'Visual direction',
    projectScoped: true,
  },
  {
    href: '/customer/inspiration',
    label: 'Inspirations',
    icon: Sparkles,
    desc: 'Select assets',
    projectScoped: true,
  },
  {
    href: '/customer/meetings/request',
    label: 'Book review',
    icon: Calendar,
    desc: 'Request meeting',
    projectScoped: true,
  },
];
interface DashboardShortcutsProps {
  activeProjectId?: string | null;
  layout?: 'grid' | 'horizontal';
}
export function DashboardShortcuts({
  activeProjectId,
  layout = 'grid',
}: DashboardShortcutsProps) {
  const inspirationHref = useActiveProjectHref('/customer/inspiration');
  const meetingHref = useActiveProjectHref('/customer/meetings/request');
  const links = shortcuts.map((item) => {
    let href = item.href;
    if (item.projectScoped && activeProjectId) {
      if (item.href === '/customer/inspiration') href = inspirationHref;
      else if (item.href === '/customer/meetings/request') href = meetingHref;
      else if (item.href === '/customer/moodboard') {
        href = `/customer/moodboard/create?projectId=${activeProjectId}`;
      }
    }
    return { ...item, href };
  });
  if (layout === 'horizontal') {
    return (
      <section>
        <h3 className="text-sm font-semibold text-foreground">Quick access</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Jump to the tools you use most during collection development.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group inline-flex items-center gap-3 bg-portal-surface px-5 py-3 transition-all"
            >
              <div className="flex h-9 w-9 items-center justify-center bg-secondary text-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <item.icon className="h-4 w-4" />
              </div>
              <div className="pr-1">
                <p className="text-sm font-medium text-foreground">
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }
  return (
    <section className="shrink-0">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Shortcuts</h3>
      <div className="grid grid-cols-2 gap-4">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex flex-col gap-4 border border-portal-border bg-portal-surface p-5 transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center bg-secondary text-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
              <item.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {item.label}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
