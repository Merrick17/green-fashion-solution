import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
type PortalPanelProps = {
  children: ReactNode;
  className?: string;
  muted?: boolean;
};
export function PortalPanel({ children, className, muted }: PortalPanelProps) {
  return (
    <div
      className={cn(muted ? 'border border-portal-border bg-portal-surface-muted' : 'border border-portal-border bg-portal-surface', className)}
    >
      {children}
    </div>
  );
}
