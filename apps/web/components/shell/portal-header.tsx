'use client';

import { Menu, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NotificationBell } from '@/components/shared/notification-bell';
import { ActiveProjectSwitcher } from '@/components/customer/active-project-switcher';
import { Logo } from '@/components/design-system/logo';
import { ThemeToggle } from './theme-toggle';
import { AvatarMenu } from './avatar-menu';
import { SidebarNav } from './sidebar-nav';
import type { PortalConfig } from './types';

interface PortalHeaderProps {
  portal: PortalConfig;
  settingsHref?: string;
  avatarFallback: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function PortalHeader({
  portal,
  settingsHref,
  avatarFallback,
  collapsed,
  onToggleCollapse,
}: PortalHeaderProps) {
  const isCustomer = portal.variant === 'customer';
  const showThemeToggle = true;
  const showNotifications = portal.variant !== 'designer';

  return (
    <header className="h-14 flex shrink-0 items-center justify-between border-b border-portal-border bg-portal-main px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-60 border-portal-sidebar-border bg-portal-sidebar p-0"
          >
            <div className="border-b border-portal-sidebar-border px-4 py-4">
              <Logo
                href={`${portal.basePath}/dashboard`}
                variant="dark"
                height={24}
              />
            </div>
            <SidebarNav
              navGroups={portal.navGroups}
              basePath={portal.basePath}
              variant={portal.variant}
            />
          </SheetContent>
        </Sheet>

        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 md:inline-flex"
            onClick={onToggleCollapse}
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <PanelLeftClose className="h-4 w-4" strokeWidth={1.5} />
            )}
          </Button>
        )}

        {!isCustomer && (
          <span className="hidden text-xs text-muted-foreground md:inline">
            {portal.label}
          </span>
        )}
        {isCustomer && <ActiveProjectSwitcher />}
      </div>

      <div className="flex items-center gap-1">
        {showThemeToggle && <ThemeToggle />}
        {showNotifications && (
          <NotificationBell
            notificationsPageHref={`${portal.basePath}/notifications`}
          />
        )}
        <AvatarMenu fallback={avatarFallback} settingsHref={settingsHref} />
      </div>
    </header>
  );
}
