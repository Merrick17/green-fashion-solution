'use client';
import { useState } from 'react';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import { Skeleton } from '@/components/shared/skeleton';
import { useUsers } from '@/hooks/use-users';
import { useCreateAdminUser } from '@/hooks/use-admin';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/shared/pagination-controls';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserRole } from '@repo/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UsersTable } from './users-table';
export default function AdminUsersPage() {
  const { setPage, params } = usePagination(20);
  const { data, isLoading } = useUsers(params);
  const createUser = useCreateAdminUser();
  const users = data?.data ?? [];
  const [createOpen, setCreateOpen] = useState(false);
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.DESIGNER);
  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createUser.mutate(
      {
        name: fd.get('name') as string,
        email: fd.get('email') as string,
        password: fd.get('password') as string,
        role: newUserRole,
      },
      { onSuccess: () => setCreateOpen(false) },
    );
  };
  const createAction = (
    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Create user</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create user account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-3 pt-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input name="name" required />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input name="password" type="password" minLength={8} required />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={newUserRole}
              onValueChange={(v) => setNewUserRole(v as UserRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.CUSTOMER}>Customer</SelectItem>
                <SelectItem value={UserRole.DESIGNER}>Designer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={createUser.isPending}>
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
  if (isLoading)
    return (
      <AppPage width="full">
        <PageHeader
          title="Users"
          description="Create, block, and manage all platform accounts"
          actions={createAction}
        />
        <Skeleton className="h-64 w-full" />
      </AppPage>
    );
  return (
    <AppPage width="full">
      <PageHeader
        title="Users"
        description="Create, block, and manage all platform accounts"
        actions={createAction}
      />
      <UsersTable users={users} />
      {!isLoading && users.length > 0 && (
        <PaginationControls meta={data?.meta} onPageChange={setPage} />
      )}
    </AppPage>
  );
}
