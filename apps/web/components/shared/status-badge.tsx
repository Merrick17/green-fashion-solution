import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
type Variant = 'default' | 'success' | 'warning' | 'error' | 'muted';
const variantStyles: Record<Variant, string> = {
  default: 'bg-secondary text-secondary-foreground',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
  muted: 'bg-muted text-muted-foreground',
};
const statusVariants: Record<string, Variant> = {
  APPROVED: 'success',
  COMPLETED: 'success',
  SENT: 'warning',
  REQUESTED: 'warning',
  IN_REVIEW: 'warning',
  CHANGES_REQUESTED: 'warning',
  REJECTED: 'error',
  CANCELLED: 'error',
  SCHEDULED: 'success',
  PENDING: 'muted',
  DRAFT: 'muted',
};
interface StatusBadgeProps {
  status: string;
  className?: string;
}
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = statusVariants[status] ?? 'default';
  const label = status.replace(/_/g, ' ').toLowerCase();
  return (
    <Badge
      variant="outline"
      className={cn(variantStyles[variant], className, 'capitalize')}
    >
      {label}
    </Badge>
  );
}
