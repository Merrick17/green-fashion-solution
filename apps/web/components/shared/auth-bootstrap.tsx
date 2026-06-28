'use client';

import { useEffect } from 'react';
import { refreshSession } from '@/lib/auth/refresh-session';
import { useAuthStore } from '@/lib/auth-store';

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  useEffect(() => {
    if (accessToken) return;

    void refreshSession().then((token) => {
      if (token) setAccessToken(token);
    });
  }, [accessToken, setAccessToken]);

  return <>{children}</>;
}
