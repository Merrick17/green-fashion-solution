'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

export const PROJECT_CHAPTERS = [
  { id: 'overview', label: 'Overview' },
  { id: 'inspiration', label: 'Inspiration' },
  { id: 'moodboard', label: 'Moodboards' },
  { id: 'research', label: 'Research' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'execution', label: 'Execution' },
] as const;

type ProjectTabNavProps = {
  projectId: string;
  activeTab: string;
};

export function ProjectTabNav({ projectId, activeTab }: ProjectTabNavProps) {
  return (
    <nav
      aria-label="Project sections"
      className="sticky top-0 z-30 -mx-1 flex gap-2 overflow-x-auto border-b border-portal-border bg-portal-main py-3"
    >
      {PROJECT_CHAPTERS.map((ch) => {
        const isActive = activeTab === ch.id;
        return (
          <Link
            key={ch.id}
            href={`/customer/projects/${projectId}?tab=${ch.id}`}
            className={cn(
              'shrink-0 px-4 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-portal-accent text-portal-accent-foreground'
                : 'text-muted-foreground leading-relaxed hover:bg-portal-hover hover:text-portal-foreground',
            )}
          >
            {ch.label}
          </Link>
        );
      })}
    </nav>
  );
}
