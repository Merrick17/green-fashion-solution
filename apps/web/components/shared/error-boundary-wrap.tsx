'use client';
import { useState, type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { Button } from '@/components/ui/button';
interface PanelErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom fallback. Defaults to a compact panel error with a retry button. */ fallback?: ReactNode;
} /** * PanelErrorBoundary — a thin wrapper around the existing (previously-unused) ErrorBoundary * that isolates a risky panel (e.g. an AI streaming surface) so a throw inside it does NOT * propagate to the surrounding page. The canvas/form/list around it keeps working. * * The default fallback offers a "Try again" button that remounts the boundary via a key bump, * recovering the panel without a full page reload. Reuses the existing ErrorBoundary as-is * (no modification to error-boundary.tsx). */
export function PanelErrorBoundary({
  children,
  fallback,
}: PanelErrorBoundaryProps) {
  const [retryKey, setRetryKey] = useState(0);
  return (
    <ErrorBoundary
      key={retryKey}
      fallback={
        fallback ?? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-sm font-medium text-foreground">
              This panel hit an error
            </p>
            <p className="max-w-xs text-xs text-muted-foreground">
              The rest of the page is unaffected. Try reloading the panel.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRetryKey((k) => k + 1)}
            >
              Try again
            </Button>
          </div>
        )
      }
    >
      {children}
    </ErrorBoundary>
  );
}
