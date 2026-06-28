import { formatDateTime } from '@repo/utils';
interface EntityTimestampsProps {
  createdAt?: string;
  updatedAt?: string;
  extra?: { label: string; value: string }[];
  className?: string;
}
export function EntityTimestamps({
  createdAt,
  updatedAt,
  extra,
  className,
}: EntityTimestampsProps) {
  const showUpdated =
    updatedAt &&
    createdAt &&
    new Date(updatedAt).getTime() !== new Date(createdAt).getTime();
  return (
    <div
      className={`text-xs text-muted-foreground space-y-0.5 ${className ?? ''}`}
    >
      {createdAt && <p>Created {formatDateTime(createdAt)}</p>}
      {showUpdated && updatedAt && <p>Updated {formatDateTime(updatedAt)}</p>}
      {extra?.map(({ label, value }) => (
        <p key={label}>
          {label} {formatDateTime(value)}
        </p>
      ))}
    </div>
  );
}
