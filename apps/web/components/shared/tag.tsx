import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
export type TagTone =
  | 'neutral'
  | 'accent'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'outline';
const toneStyles: Record<TagTone, string> = {
  neutral: 'bg-portal-surface-muted border-portal-border text-portal-muted',
  accent: 'bg-portal-accent/10 border-portal-accent/40 text-portal-accent',
  success: 'bg-success/10 border-success/30 text-success',
  warning: 'bg-warning/10 border-warning/30 text-warning',
  destructive: 'bg-destructive/10 border-destructive/30 text-destructive',
  outline: 'bg-transparent border-portal-border text-portal-foreground',
};
interface TagProps {
  children: ReactNode;
  tone?: TagTone;
  className?: string;
} /** * General-purpose border-b border-border pill. Use in place of StatusBadge for non-status * semantics (role, read state, category, etc.). StatusBadge stays reserved * for lifecycle status values. */
export function Tag({ children, tone = 'neutral', className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border px-2 py-0.5 text-xs font-medium',
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
type UserRole = 'CUSTOMER' | 'DESIGNER' | 'ADMIN';
const roleMap: Record<UserRole, { label: string; tone: TagTone }> = {
  CUSTOMER: { label: 'Customer', tone: 'neutral' },
  DESIGNER: { label: 'Designer', tone: 'outline' },
  ADMIN: { label: 'Admin', tone: 'accent' },
};
interface RoleTagProps {
  role: string;
  className?: string;
} /** Role tag — maps a user role string to a label + tone. */
export function RoleTag({ role, className }: RoleTagProps) {
  const entry = roleMap[role as UserRole] ?? {
    label: role.replace(/_/g, ' '),
    tone: 'neutral' as TagTone,
  };
  return (
    <Tag tone={entry.tone} className={className}>
      {entry.label}
    </Tag>
  );
}
interface ReadStateProps {
  read: boolean;
  className?: string;
} /** Read state — read renders a muted "Read", unread renders an accent dot + "New". */
export function ReadState({ read, className }: ReadStateProps) {
  if (read) {
    return (
      <Tag tone="neutral" className={className}>
        Read
      </Tag>
    );
  }
  return (
    <Tag tone="accent" className={className}>
      <span className="size-1.5 bg-portal-accent" aria-hidden /> New
    </Tag>
  );
}
