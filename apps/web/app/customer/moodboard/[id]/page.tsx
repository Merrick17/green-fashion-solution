import { Suspense } from 'react';
import { CanvasPageContent } from './canvas-page-content';
export default function MoodboardCanvasPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ autoOpenAi?: string; autoOpenUpload?: string }>;
}) {
  return (
    <div className="h-full min-h-0">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Loading moodboard…</p>
          </div>
        }
      >
        <CanvasPageContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
