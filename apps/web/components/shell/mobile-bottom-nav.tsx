'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FolderKanban,
  Sparkles,
  FileText,
  Calendar,
  MessageSquare,
  Palette,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const tabs = [
  { href: '/dashboard', label: 'Collections', icon: FolderKanban },
  { href: '/inspiration', label: 'Inspiration', icon: Sparkles },
  { href: '/moodboard', label: 'Moodboards', icon: Palette },
  { href: '/proposals', label: 'Presentations', icon: FileText },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
] as const;

type Props = { basePath: string };

export function MobileBottomNav({ basePath }: Props) {
  const pathname = usePathname();
  const primary = tabs.slice(0, 4);
  const overflow = tabs.slice(4);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[var(--z-sticky)] border-t border-portal-border bg-portal-main/95 backdrop-blur-md md:hidden"
      aria-label="Mobile navigation"
    >
      <ul className="flex min-h-11 items-stretch justify-around">
        {primary.map((tab) => {
          const href = `${basePath}${tab.href}`;
          const active =
            pathname === href ||
            (tab.href !== '/dashboard' && pathname.startsWith(href));
          return (
            <li key={href} className="flex flex-1">
              <Link
                href={href}
                className={cn(
                  'flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium transition-colors',
                  active ? 'text-portal-accent' : 'text-muted-foreground',
                )}
              >
                <tab.icon className="h-4 w-4" strokeWidth={1.5} />
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
        <li className="flex flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex min-h-11 min-w-11 h-full w-full flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium text-muted-foreground"
                aria-label="More navigation options"
              >
                <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
                <span>More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="mb-2">
              {overflow.map((tab) => {
                const href = `${basePath}${tab.href}`;
                return (
                  <DropdownMenuItem key={href} asChild>
                    <Link href={href}>{tab.label}</Link>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuItem asChild>
                <Link href={`${basePath}/settings`}>Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`${basePath}/notifications`}>Notifications</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
      </ul>
    </nav>
  );
}
