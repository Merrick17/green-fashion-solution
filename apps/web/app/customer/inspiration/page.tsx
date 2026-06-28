import { Suspense } from 'react';
import { InspirationContent } from './inspiration-content';
import { RouteSkeleton } from '@/components/shared/route-skeleton';
export default function CustomerInspirationPage() {
  return (
    <Suspense fallback={<RouteSkeleton variant="masonry" />}>
      <InspirationContent />
    </Suspense>
  );
}
