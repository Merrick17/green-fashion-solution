import { Suspense } from 'react';
import { NewProposalContent } from './new-proposal-content';
import { Skeleton } from '@/components/shared/skeleton';
export default function NewProposalPage() {
  return (
    <Suspense fallback={<Skeleton className="h-48 w-full" />}>
      <NewProposalContent />
    </Suspense>
  );
}
