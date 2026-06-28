'use client';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EntityTimestamps } from '@/components/shared/entity-timestamps';
import { StatusBadge } from '@/components/shared/status-badge';
import { BriefType, BriefPriority, TaskStatus, type Task } from '@repo/types';
import { formatDateTime } from '@repo/utils';
const BRIEF_TYPE_LABELS: Record<BriefType, string> = {
  [BriefType.FABRIC_SOURCING]: 'Fabric sourcing',
  [BriefType.PRODUCT_REFERENCE]: 'Product reference',
  [BriefType.STYLE_DIRECTION]: 'Style direction',
  [BriefType.TECHNICAL_REVIEW]: 'Technical review',
  [BriefType.SAMPLE_PREP]: 'Sample prep',
};
const PRIORITY_VARIANT: Record<
  BriefPriority,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  [BriefPriority.LOW]: 'outline',
  [BriefPriority.MEDIUM]: 'secondary',
  [BriefPriority.HIGH]: 'default',
  [BriefPriority.URGENT]: 'destructive',
};
interface DesignBriefCardProps {
  brief: Task;
  onStart?: () => void;
  onComplete?: () => void;
  uploadHref?: string;
}
export function DesignBriefCard({
  brief,
  onStart,
  onComplete,
  uploadHref,
}: DesignBriefCardProps) {
  const isOverdue =
    brief.dueDate &&
    brief.status !== TaskStatus.COMPLETED &&
    new Date(brief.dueDate) < new Date();
  const uploadHrefWithBrief = uploadHref
    ? `${uploadHref}${uploadHref.includes('?') ? '&' : '?'}briefId=${brief.id}`
    : undefined;

  return (
    <div className="border border-border bg-card space-y-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{brief.title}</p>
            <Badge variant={PRIORITY_VARIANT[brief.priority]}>
              {brief.priority}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {brief.projectRef ?? `Project ${brief.projectId.slice(0, 8)}`} ·
            {BRIEF_TYPE_LABELS[brief.briefType]}
          </p>
        </div>
        <StatusBadge status={brief.status} />
      </div>
      {brief.description && (
        <p className="text-sm text-muted-foreground">{brief.description}</p>
      )}
      {brief.deliverables && (
        <div className=" bg-secondary/50 px-3 py-2 text-sm">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Expected deliverables
          </p>
          <p>{brief.deliverables}</p>
        </div>
      )}
      <EntityTimestamps
        createdAt={brief.createdAt}
        updatedAt={brief.updatedAt}
        extra={
          brief.dueDate
            ? [{ label: isOverdue ? 'Overdue' : 'Due', value: brief.dueDate }]
            : undefined
        }
      />
      <div className="flex flex-wrap gap-2 pt-1">
        {uploadHrefWithBrief && brief.status !== TaskStatus.COMPLETED && (
          <Button asChild size="sm" variant="outline">
            <Link href={uploadHrefWithBrief}>Upload assets</Link>
          </Button>
        )}
        {brief.status === TaskStatus.PENDING && onStart && (
          <Button size="sm" onClick={onStart}>
            Start brief
          </Button>
        )}
        {brief.status === TaskStatus.IN_PROGRESS && onComplete && (
          <Button size="sm" onClick={onComplete}>
            Mark complete
          </Button>
        )}
        {brief.dueDate && isOverdue && (
          <span className="text-xs text-destructive self-center">
            Due {formatDateTime(brief.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}
