'use client';

import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'sonner';
import { WS_EVENTS } from '@repo/types';

let socket: Socket | null = null;

export function NotificationsSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();

  useEffect(() => {
    if (!token) {
      socket?.disconnect();
      socket = null;
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';
    socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      randomizationFactor: 0.5,
      timeout: 20000,
    });

    socket.on(WS_EVENTS.NOTIFICATION, () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
      toast.message('New notification');
    });

    socket.on(WS_EVENTS.PROPOSAL_UPDATED, () => {
      qc.invalidateQueries({ queryKey: queryKeys.proposals.all });
    });

    socket.on(WS_EVENTS.MEETING_UPDATED, () => {
      qc.invalidateQueries({ queryKey: queryKeys.meetings.all });
    });

    socket.on(WS_EVENTS.PROJECT_STATUS, () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.all });
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [token, qc]);

  return <>{children}</>;
}
