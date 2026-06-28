'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AppPage } from '@/components/layout';
import { BriefWizard } from '@/components/customer/brief/brief-wizard';

export default function NewProjectPage() {
  return (
    <AppPage variant="dashboard" width="full" className="max-w-4xl">
      <Link
        href="/customer/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground leading-relaxed transition-colors hover:text-portal-accent"
      >
        <ArrowLeft className="h-4 w-4" /> Back to projects
      </Link>

      <header className="border border-portal-border border-l-[3px] border-l-portal-accent bg-portal-surface px-7 py-7 sm:px-8">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">New collection brief</p>
        <h1 className="mt-2 font-serif text-[length:var(--text-display-sm)] leading-[var(--leading-heading)] tracking-[var(--tracking-display)] tracking-tight text-portal-foreground">
          Start a sourcing project
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground leading-relaxed">
          Tell us about your collection. Once created, upload references, build
          your moodboard, and submit the brief to our sourcing team.
        </p>
      </header>

      <BriefWizard />
    </AppPage>
  );
}
