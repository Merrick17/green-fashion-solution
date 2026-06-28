'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavGroup, PortalVariant } from './types';
interface SidebarNavProps {
  navGroups: NavGroup[];
  basePath: string;
  collapsed?: boolean;
  variant?: PortalVariant;
}
export function SidebarNav({
  navGroups,
  basePath,
  collapsed,
  variant = 'default',
}: SidebarNavProps) {
  const pathname = usePathname();
  const collapsible = variant === 'admin';
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      navGroups.map((g, i) => [g.label ?? `group-${i}`, true]),
    ),
  );
  function toggleGroup(key: string) {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  }
  return (
    <nav className="flex flex-col gap-3 overflow-y-auto p-3">
      {navGroups.map((group, gi) => {
        const groupKey = group.label ?? `group-${gi}`;
        const isOpen = openGroups[groupKey] ?? true;
        return (
          <div key={groupKey}>
            {group.label && !collapsed && (
              <button
                type="button"
                onClick={() => collapsible && toggleGroup(groupKey)}
                aria-expanded={collapsible ? isOpen : undefined}
                aria-controls={collapsible ? `nav-group-${groupKey}` : undefined}
                className={cn(
                  'mb-1.5 flex w-full items-center justify-between px-2 py-1',
                  collapsible && 'cursor-pointer',
                )}
              >
                <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-portal-sidebar-muted">
                  {group.label}
                </span>
                {collapsible && (
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 text-portal-sidebar-muted transition-transform',
                      !isOpen && '-rotate-90',
                    )}
                    strokeWidth={1.5}
                  />
                )}
              </button>
            )}
            {(!collapsible || isOpen || collapsed) && (
              <div
                id={collapsible ? `nav-group-${groupKey}` : undefined}
                className="flex flex-col gap-0.5"
              >
                {group.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== `${basePath}/dashboard` &&
                      pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      aria-label={collapsed ? item.label : undefined}
                      className={cn(
                        'flex items-center gap-2.5 text-[13px] leading-tight transition-colors duration-150',
                        collapsed ? 'justify-center px-2 py-2' : 'px-2.5 py-1.5',
                        active
                          ? 'border-l-2 border-l-portal-accent bg-portal-hover font-medium text-portal-sidebar-foreground'
                          : 'text-portal-sidebar-muted hover:bg-portal-hover hover:text-portal-sidebar-foreground',
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          active && 'text-portal-accent',
                        )}
                        strokeWidth={1.5}
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
