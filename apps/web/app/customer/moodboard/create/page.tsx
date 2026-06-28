'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Upload, PenTool, ArrowLeft, Loader2 } from 'lucide-react';
import { useCreateMoodboard, useMoodboards } from '@/hooks/use-moodboards';

export default function CreateMoodboardPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const { projectId } = use(searchParams);
  const router = useRouter();
  const createMoodboard = useCreateMoodboard();
  const { data: existingData, isLoading: isLoadingExisting } = useMoodboards(
    projectId ?? '',
  );
  const existing = existingData?.data?.[0];
  const [creatingType, setCreatingType] = useState<
    'scratch' | 'ai' | 'upload' | null
  >(null);
  const [createError, setCreateError] = useState(false);

  useEffect(() => {
    if (!projectId) {
      router.replace('/customer/moodboard');
    } else if (existing) {
      router.replace(`/customer/moodboard/${existing.id}`);
    }
  }, [projectId, existing, router]);

  const handleCreate = (type: 'scratch' | 'ai' | 'upload') => {
    if (!projectId) return;
    setCreatingType(type);

    createMoodboard.mutate(
      {
        projectId,
        styleDirection: 'New Moodboard',
        colorPalette: [],
        fabricSuggestions: [],
        mood: type === 'ai' ? 'Co-creating' : 'Exploring ideas',
      },
      {
        onSuccess: (moodboard) => {
          let query = '';
          if (type === 'ai') query = '?autoOpenAi=true';
          if (type === 'upload') query = '?autoOpenUpload=true';
          router.replace(`/customer/moodboard/${moodboard.id}${query}`);
        },
        onError: () => {
          setCreatingType(null);
          setCreateError(true);
        },
      },
    );
  };

  if (isLoadingExisting || existing || !projectId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col gap-8 mx-auto max-w-5xl py-12">
      <Link
        href="/customer/moodboard"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to moodboards
      </Link>

      <header className="mb-12 text-center">
        <h1 className="font-serif text-4xl tracking-tight text-foreground">
          How would you like to start?
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
          Create a moodboard to define the visual direction for your project.
          Choose a starting point below.
        </p>
      </header>

      {createError && (
        <p className="mb-6 text-center text-sm text-destructive" role="alert">
          Could not create moodboard. Please try again.
        </p>
      )}

      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
        <button
          type="button"
          onClick={() => handleCreate('scratch')}
          disabled={creatingType !== null}
          className="group relative flex flex-col items-center justify-center gap-4 bg-portal-surface p-8 text-center transition-all disabled:opacity-50"
        >
          <div className="flex h-16 w-16 items-center justify-center bg-portal-surface-muted text-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <PenTool className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Start from Scratch</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a moodboard yourself using our canvas tools.
            </p>
          </div>
          {creatingType === 'scratch' && (
            <Loader2 className="absolute right-4 top-4 h-5 w-5 animate-spin text-muted-foreground" />
          )}
        </button>

        <button
          type="button"
          onClick={() => handleCreate('upload')}
          disabled={creatingType !== null}
          className="group relative flex flex-col items-center justify-center gap-4 bg-portal-surface p-8 text-center transition-all disabled:opacity-50"
        >
          <div className="flex h-16 w-16 items-center justify-center bg-portal-surface-muted text-foreground transition-colors group-hover:bg-secondary group-hover:text-secondary-foreground">
            <Upload className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Upload &amp; Parse</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload an existing image and we&apos;ll pull the visual elements
              out for you.
            </p>
          </div>
          {creatingType === 'upload' && (
            <Loader2 className="absolute right-4 top-4 h-5 w-5 animate-spin text-muted-foreground" />
          )}
        </button>

        <button
          type="button"
          onClick={() => handleCreate('ai')}
          disabled={creatingType !== null}
          className="group relative flex flex-col items-center justify-center gap-4 bg-portal-surface p-8 text-center transition-all disabled:opacity-50"
        >
          <div className="flex h-16 w-16 items-center justify-center bg-portal-surface-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Sparkles className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Co-create</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Describe your vision and let your creative partner set up an
              initial board.
            </p>
          </div>
          {creatingType === 'ai' && (
            <Loader2 className="absolute right-4 top-4 h-5 w-5 animate-spin text-muted-foreground" />
          )}
        </button>
      </div>
    </div>
  );
}
