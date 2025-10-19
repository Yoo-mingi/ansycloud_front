'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/app/config';
import { useAuth } from '@/app/providers/AuthProvider';
import SiteTable from './SiteTable';

export default function SiteContent() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { accessToken, refresh, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchSites = async () => {
      setLoading(true);
      setError(null);
      
      console.log('[SiteContent] Current accessToken:', accessToken);
      
      try {
        // 첫 번째 요청
        let res = await fetch(`${API_BASE_URL}/api/site/site`, {
          headers: {
            ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
          }
        });

        console.log('[SiteContent] Response status:', res.status);

        // 401 에러면 refresh 시도
        if (res.status === 401) {
          console.log('[SiteContent] 401 error, attempting refresh...');
          const newToken = await refresh();
          console.log('[SiteContent] New token after refresh:', newToken);
          
          if (!newToken) {
            console.log('[SiteContent] Refresh failed, logging out...');
            await logout();
            router.push('/login');
            return;
          }

          // 새 토큰으로 재시도
          res = await fetch(`${API_BASE_URL}/api/site/site`, {
            headers: { 'Authorization': `Bearer ${newToken}` }
          });
          console.log('[SiteContent] Retry response status:', res.status);
        }

        if (!res.ok) throw new Error('Failed to fetch sites');
        
        const data = await res.json();
        setSites(data.sites || data || []);
      } catch (err) {
        console.error('Failed to fetch sites:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, [accessToken, refresh, logout, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-[#e4e6eb] mb-2">Failed to load sites</h3>
        <p className="text-[#9ca3af]">{error}</p>
      </div>
    );
  }

  return <SiteTable sites={sites} loading={loading} />;
}
