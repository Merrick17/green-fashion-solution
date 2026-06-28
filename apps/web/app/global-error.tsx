'use client';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Fatal Error</p>
        <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="mt-2 text-sm text-gray-500 max-w-md">
          This error has been reported automatically. Try reloading the page.
        </p>
        <button
          onClick={reset}
          className="mt-6 px-4 py-2 text-sm font-medium bg-black text-white hover:bg-gray-800 transition-colors"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
