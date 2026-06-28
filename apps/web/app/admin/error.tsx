'use client';
import { RouteError } from '@/components/shared/route-error';
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <RouteError message={error.message} reset={reset} />;
}
