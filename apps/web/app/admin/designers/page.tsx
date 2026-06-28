'use client';
import Link from 'next/link';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import { EntityList } from '@/components/shared/entity-list';
import { useUsers } from '@/hooks/use-users';
import { UserRole } from '@repo/types';
import { AdminEntityRow } from '@/components/admin/admin-entity-row';
import { Button } from '@/components/ui/button';
const listParams = { page: 1, limit: 100 };
export default function AdminDesignersPage() {
  const { data, isLoading } = useUsers(listParams);
  const designers = (data?.data ?? []).filter(
    (u) => u.role === UserRole.DESIGNER,
  );
  return (
    <AppPage width="full">
      <PageHeader
        title="Designers"
        description="Internal asset contributors"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/tasks/assign">Assign Brief</Link>
          </Button>
        }
      />
      <EntityList
        items={designers}
        isLoading={isLoading}
        loadingVariant="rows"
        emptyTitle="No designers"
        emptyDescription="Designer accounts will appear here."
        renderItem={(d) => (
          <AdminEntityRow
            key={d.id}
            title={d.name}
            subtitle={d.email}
            createdAt={d.createdAt}
            updatedAt={d.updatedAt}
          />
        )}
      />
    </AppPage>
  );
}
