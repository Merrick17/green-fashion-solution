'use client';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/design-system/logo';
import { PortalHeader } from './portal-header';
import { SidebarNav } from './sidebar-nav';
import { MobileBottomNav } from './mobile-bottom-nav';
import { useSidebarCollapse } from './use-sidebar-collapse';
import type { PortalConfig } from './types';
interface PortalShellProps {
  portal: PortalConfig;
  settingsHref?: string;
  avatarFallback: string;
  fullBleedRoutes?: RegExp[];
  children: React.ReactNode;
}
export function PortalShell({
  portal,
  settingsHref,
  avatarFallback,
  fullBleedRoutes = [],
  children,
}: PortalShellProps) {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebarCollapse();
  const fullBleed = fullBleedRoutes.some((re) => re.test(pathname));
  const isCustomer = portal.variant === 'customer';
  const portalVariant = portal.variant ?? 'default';
  const immersive = fullBleed;
  return (
    <div
      className="flex h-dvh min-h-0 overflow-hidden bg-portal-main text-portal-foreground"
      data-portal-variant={portalVariant}
      data-immersive={immersive ? 'true' : undefined}
    >
      <a
        href="#portal-main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-portal-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>
      {!immersive && (
      <aside
        className={cn(
          'bg-portal-sidebar border-portal-sidebar-border sticky top-0 hidden h-dvh shrink-0 flex-col overflow-hidden border-r md:flex',
          collapsed ? 'md:w-14' : 'w-60',
        )}
      >
        <div className="border-b border-portal-sidebar-border px-3 py-3">
          <Logo
            href={`${portal.basePath}/dashboard`}
            variant="dark"
            height={collapsed ? 20 : 22}
            className={cn(collapsed && 'mx-auto')}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav
            navGroups={portal.navGroups}
            basePath={portal.basePath}
            collapsed={collapsed}
            variant={portal.variant}
          />
        </div>
      </aside>
      )}
      <div className="bg-portal-main flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {!immersive && (
        <PortalHeader
          portal={portal}
          settingsHref={settingsHref}
          avatarFallback={avatarFallback}
          collapsed={collapsed}
          onToggleCollapse={toggle}
        />
        )}
        <main
          id="portal-main-content"
          className={cn(
            'min-h-0 flex-1',
            fullBleed
              ? 'flex w-full flex-col overflow-hidden'
              : 'overflow-y-auto overflow-x-hidden',
            !fullBleed &&
              'flex w-full flex-col items-stretch p-6 pb-20 md:pb-6 lg:p-8',
            isCustomer && !fullBleed && 'md:pb-5',
          )}
        >
          {children}
        </main>
        {isCustomer && !immersive && <MobileBottomNav basePath={portal.basePath} />}
      </div>
    </div>
  );
}
