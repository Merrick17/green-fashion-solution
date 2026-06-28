'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { RoleTag, Tag } from '@/components/shared/tag';
import {
  useUpdateUserRole,
  useDeleteUser,
  useBlockUser,
  useUnblockUser,
} from '@/hooks/use-admin';
import { UserRole, type User } from '@repo/types';
import { formatDate } from '@repo/utils';
interface UsersTableProps {
  users: User[];
}
export function UsersTable({ users }: UsersTableProps) {
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  return (
    <div className="border border-portal-border bg-portal-surface overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead> <TableHead>Email</TableHead>
            <TableHead>Role</TableHead> <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-32 text-center text-muted-foreground"
              >
                No users yet.
              </TableCell>
            </TableRow>
          ) : (
            users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  {u.blocked ? (
                    <Tag tone="destructive">Blocked</Tag>
                  ) : (
                    <RoleTag role={u.role} />
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(u.createdAt)}
                </TableCell>
                <TableCell>
                  {u.role !== UserRole.ADMIN && (
                    <div className="flex items-center gap-2">
                      <Select
                        value={u.role}
                        onValueChange={(role) =>
                          updateRole.mutate({
                            id: u.id,
                            dto: { role: role as UserRole },
                          })
                        }
                      >
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={UserRole.CUSTOMER}>
                            Customer
                          </SelectItem>
                          <SelectItem value={UserRole.DESIGNER}>
                            Designer
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                (u.blocked ? unblockUser : blockUser).mutate(
                                  u.id,
                                )
                              }
                            >
                              {u.blocked ? 'Unblock' : 'Block'}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {u.blocked ? 'Unblock user' : 'Block user'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setDeleteTarget({ id: u.id, name: u.name })
                              }
                              disabled={deleteUser.isPending}
                            >
                              Delete
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Delete user permanently
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete user"
        description={`Delete "${deleteTarget?.name}" permanently? This cannot be undone.`}
        confirmLabel="Delete user"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          const id = deleteTarget.id;
          setDeleteTarget(null);
          deleteUser.mutate(id);
        }}
      />
    </div>
  );
}
