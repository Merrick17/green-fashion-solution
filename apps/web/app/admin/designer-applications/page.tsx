'use client';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import { Skeleton } from '@/components/shared/skeleton';
import {
  useAdminDesignerApplications,
  useRejectDesignerApplication,
  useDeleteDesignerApplication,
} from '@/hooks/use-admin';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
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
import { DesignerApplicationStatus } from '@repo/types';
import { formatDate } from '@repo/utils';
import { ApproveDialog } from './approve-dialog';
export default function AdminDesignerApplicationsPage() {
  const { setPage, params } = usePagination(20);
  const { data, isLoading } = useAdminDesignerApplications(params);
  const reject = useRejectDesignerApplication();
  const deleteApp = useDeleteDesignerApplication();
  const applications = data?.data ?? [];
  if (isLoading)
    return (
      <AppPage width="full">
        <PageHeader
          title="Designer Applications"
          description="Review applications and create designer accounts"
        />
        <Skeleton className="h-64 w-full" />
      </AppPage>
    );
  return (
    <AppPage width="full">
      <PageHeader
        title="Designer Applications"
        description="Review applications and create designer accounts"
      />
      <div className="border border-portal-border bg-portal-surface overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead> <TableHead>Email</TableHead>
              <TableHead>Status</TableHead> <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-muted-foreground"
                >
                  No applications yet.
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.name}</TableCell>
                  <TableCell>{app.email}</TableCell>
                  <TableCell>
                    <StatusBadge status={app.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(app.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {app.status === DesignerApplicationStatus.PENDING && (
                        <>
                          <ApproveDialog
                            applicationId={app.id}
                            applicantName={app.name}
                            applicantEmail={app.email}
                          />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => reject.mutate(app.id)}
                                  disabled={reject.isPending}
                                >
                                  Reject
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Reject application
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteApp.mutate(app.id)}
                              disabled={deleteApp.isPending}
                            >
                              Delete
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete application</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {!isLoading && applications.length > 0 && (
        <PaginationControls meta={data?.meta} onPageChange={setPage} />
      )}
    </AppPage>
  );
}
