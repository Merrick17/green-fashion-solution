'use client';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AssetImage } from './asset-image';
import { cn } from '@/lib/utils';
export type JobStatus = 'pending' | 'uploading' | 'done' | 'error';
export interface UploadJob {
  id: string;
  file: File;
  name: string;
  preview: string;
  progress: number;
  status: JobStatus;
}
interface AssetUploadQueueProps {
  jobs: UploadJob[];
  disabled?: boolean;
  onNameChange: (id: string, name: string) => void;
  onRemove: (id: string) => void;
} /** Renders the dropped files as large-preview cards with per-file progress. */
export function AssetUploadQueue({
  jobs,
  disabled,
  onNameChange,
  onRemove,
}: AssetUploadQueueProps) {
  if (!jobs.length) return null;
  return (
    <div className="mt-4 space-y-3">
      {jobs.map((job) => (
        <div key={job.id} className="border border-border bg-card flex gap-3 p-3">
          <AssetImage
            src={job.preview}
            alt={job.name}
            className="h-20 w-20 flex-shrink-0 rounded object-cover"
          />
          <div className="flex flex-1 flex-col gap-2">
            <Input
              value={job.name}
              disabled={disabled}
              onChange={(e) => onNameChange(job.id, e.target.value)}
            />
            <ProgressBar progress={job.progress} status={job.status} />
          </div>
          {job.status === 'done' ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-success" />
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              onClick={() => onRemove(job.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
function ProgressBar({
  progress,
  status,
}: {
  progress: number;
  status: JobStatus;
}) {
  const statusMessages: Record<JobStatus, string> = {
    pending: 'Queued',
    uploading: `Uploading… ${progress}%`,
    done: 'Uploaded',
    error: 'Failed — remove and re-add to retry',
  };

  return (
    <div className="space-y-1">
      <div className="h-1.5 w-full overflow-hidden bg-muted">
        <div
          className={cn(
            'h-full transition-all',
            status === 'error' ? 'bg-destructive' : 'bg-accent',
          )}
          style={{ width: `${status === 'done' ? 100 : progress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{statusMessages[status]}</p>
    </div>
  );
}
