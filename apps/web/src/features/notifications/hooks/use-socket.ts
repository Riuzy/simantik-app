'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../stores/auth-store';
import { appConfig } from '../../../config';

export function useNotificationSocket() {
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  useEffect(() => {
    if (!token || !user) return;

    const wsUrl = appConfig.apiBaseUrl.replace('/api', '');
    const s = io(wsUrl, {
      path: '/ws',
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    s.on('notification:new', () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['unread-count'] });
    });

    socketRef.current = s;

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [token, user, qc]);

  return socketRef;
}
