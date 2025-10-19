'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';

export function useProtectedRoute() {
  const { isAuthenticated, refresh } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('[ProtectedRoute] Not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    // 백그라운드에서 토큰 갱신 시도
    const verifyAuth = async () => {
      const token = await refresh();
      if (!token) {
        console.log('[ProtectedRoute] Token refresh failed, redirecting to login');
        router.push('/login');
      }
    };

    verifyAuth();
  }, [isAuthenticated, refresh, router]);

  return { isAuthenticated };
}
