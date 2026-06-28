'use client';
import { BriefOptionType } from '@repo/types';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import { BriefOptionsPanel } from '@/components/admin/brief-options-panel';
import { useAdminBriefOptions } from '@/hooks/use-brief-options';
import { Skeleton } from '@/components/shared/skeleton';
export default function AdminBriefOptionsPage() {
  const { data, isLoading } = useAdminBriefOptions();
  const options = data ?? [];
  const seasons = options.filter((o) => o.type === BriefOptionType.SEASON);
  const categories = options.filter((o) => o.type === BriefOptionType.CATEGORY);
  return (
    <AppPage width="full">
      <PageHeader
        title="Categories & seasons"
        description="Manage the options customers see when creating project briefs and admins use in proposals."
      />
      {isLoading ? (
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="h-64" /> <Skeleton className="h-64" />
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-2">
          <BriefOptionsPanel
            type={BriefOptionType.SEASON}
            title="Seasons"
            description="Collection seasons and drops shown in customer briefs."
            options={seasons}
          />
          <BriefOptionsPanel
            type={BriefOptionType.CATEGORY}
            title="Categories"
            description="Product categories customers can assign to projects."
            options={categories}
          />
        </div>
      )}
    </AppPage>
  );
}
