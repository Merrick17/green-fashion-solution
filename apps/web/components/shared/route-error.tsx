'use client';
import { Button } from '@/components/ui/button';

interface RouteErrorProps {
  title?: string;
  message?: string;
  suggestion?: string;
  reset?: () => void;
}

export function RouteError({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  suggestion,
  reset,
}: RouteErrorProps) {
  const displayMessage =
    message.includes('fetch') || message.includes('Network')
      ? 'We could not load this data. Check your connection and try again.'
      : message;

  const displaySuggestion =
    suggestion ??
    (message.includes('fetch') || message.includes('Network')
      ? 'Your unsaved changes are preserved. Refresh when your connection is restored.'
      : 'If the problem persists, try refreshing the page.');

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{displayMessage}</p>
      <p className="mt-1 max-w-md text-xs text-[--portal-muted]">{displaySuggestion}</p>
      {reset && (
        <Button className="mt-4" onClick={reset}>
          Try again
        </Button>
      )}
    </div>
  );
}
