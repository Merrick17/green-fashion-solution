'use client';
import { useState } from 'react';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import { SectionCard } from '@/components/shared/section-card';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
  useMe,
  useUpdateEmailNotifications,
  useExportMyData,
  useDeleteMyAccount,
} from '@/hooks/use-users-me';
import { useLogout } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/shared/skeleton';
import { RouteError } from '@/components/shared/route-error';
import { toast } from 'sonner';
export function AccountSettingsContent() {
  const { data: user, isLoading, isError, refetch } = useMe();
  const updateEmail = useUpdateEmailNotifications();
  const exportData = useExportMyData();
  const deleteAccount = useDeleteMyAccount();
  const logout = useLogout();
  const [deleteOpen, setDeleteOpen] = useState(false);
  if (isLoading) return <Skeleton className="h-48 w-full" />;
  if (isError) return <RouteError reset={() => void refetch()} />;
  if (!user) return <RouteError title="Not signed in" message="Please sign in again to manage your account." />;
  const canDelete = user.role !== 'ADMIN';
  return (
    <AppPage width="narrow">
      <PageHeader title="Account settings" description={user.email} />
      <SectionCard title="Notifications">
        <div className="flex items-center gap-2">
          <Checkbox
            id="email-notifications"
            checked={user.emailNotifications !== false}
            onCheckedChange={(checked) => {
              updateEmail.mutate(Boolean(checked), {
                onSuccess: () => toast.success('Email preferences saved'),
              });
            }}
          />
          <Label htmlFor="email-notifications">
            Email me about proposals, meetings, and status changes
          </Label>
        </div>
      </SectionCard>
      <SectionCard title="Your data">
        <Button
          variant="outline"
          onClick={() =>
            exportData.mutate(undefined, {
              onSuccess: () => toast.success('Export downloaded'),
            })
          }
          disabled={exportData.isPending}
        >
          Download my data (JSON)
        </Button>
      </SectionCard>
      {canDelete && (
        <SectionCard title="Danger zone" className="border-destructive/30">
          <Button
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            disabled={deleteAccount.isPending}
          >
            Delete account
          </Button>
        </SectionCard>
      )}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete account"
        description="Delete your account permanently? This cannot be undone."
        confirmLabel="Delete account"
        destructive
        onConfirm={() => {
          deleteAccount.mutate(undefined, {
            onSuccess: () => {
              toast.success('Account deleted');
              logout.mutate();
            },
          });
          setDeleteOpen(false);
        }}
      />
    </AppPage>
  );
}
