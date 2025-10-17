'use client';

import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children }) {
  const { accessToken, isLoading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || isLoading) return;

    if (!accessToken) {
      router.push('/login');
    }
  }, [accessToken, isLoading, isMounted, router]);

  // 로딩 중 또는 로그인 안 되어 있으면 아무것도 표시 안 함
  if (!isMounted || isLoading || !accessToken) {
    return null;
  }

  return children;
}
