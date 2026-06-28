import { Suspense } from 'react';
import { AdminTasksContent } from '../tasks-content';
import { RouteSkeleton } from '@/components/shared/route-skeleton';
export default function AssignTaskPage() {
  return (
    <Suspense fallback={<RouteSkeleton variant="form" />}>
      <AdminTasksContent />
    </Suspense>
  );
}
