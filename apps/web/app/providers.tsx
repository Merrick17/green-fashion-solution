'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { AuthBootstrap } from '@/components/shared/auth-bootstrap';
import { NotificationsSocketProvider } from '@/components/shared/notifications-socket-provider';
import { NavigationProgress } from '@/components/shared/navigation-progress';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60 * 1000, retry: 1 } },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <NavigationProgress />
        <AuthBootstrap>
          <NotificationsSocketProvider>
            {children}
            <Toaster />
          </NotificationsSocketProvider>
        </AuthBootstrap>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
