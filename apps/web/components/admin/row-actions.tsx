'use client';
import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
export interface RowActionItem {
  label: string;
  /** Run a callback when chosen. Use `href` instead for navigation. */ onSelect?: () => void;
  /** Navigate via Next Link (menu closes automatically). */ href?: string;
  destructive?: boolean;
}
interface RowActionsProps {
  items: RowActionItem[];
  align?: 'start' | 'end';
  ariaLabel?: string;
} /** * Compact `...` row menu for admin record tables. Renders one trigger and a * Radix dropdown of items. `href` items render as Links (no router needed); * `onSelect` items fire a callback (e.g. open a ConfirmDialog). */
export function RowActions({
  items,
  align = 'end',
  ariaLabel = 'Row actions',
}: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon-sm" variant="ghost" aria-label={ariaLabel}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {items.map((it) =>
          it.href ? (
            <DropdownMenuItem
              key={it.label}
              asChild
              variant={it.destructive ? 'destructive' : 'default'}
            >
              <Link href={it.href}>{it.label}</Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              key={it.label}
              variant={it.destructive ? 'destructive' : 'default'}
              onSelect={it.onSelect}
            >
              {it.label}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
