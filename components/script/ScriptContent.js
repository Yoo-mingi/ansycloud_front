'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/app/config';
import { useAuth } from '@/app/providers/AuthProvider';
import ScriptTable from '@/components/script/ScriptTable';

export default function ScriptContent() {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { accessToken, refresh, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchScripts = async () => {
      setLoading(true);
      setError(null);
      
      console.log('[ScriptContent] Current accessToken:', accessToken);
      
      try {
        // 첫 번째 요청
        let res = await fetch(`${API_BASE_URL}/api/script/scriptList`, {
          headers: {
            ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
          }
        });

        console.log('[ScriptContent] Response status:', res.status);

        // 401 에러면 refresh 시도
        if (res.status === 401) {
          console.log('[ScriptContent] 401 error, attempting refresh...');
          const newToken = await refresh();
          console.log('[ScriptContent] New token after refresh:', newToken);
          
          if (!newToken) {
            console.log('[ScriptContent] Refresh failed, logging out...');
            await logout();
            router.push('/login');
            return;
          }

          // 새 토큰으로 재시도
          res = await fetch(`${API_BASE_URL}/api/script/scriptList`, {
            headers: { 'Authorization': `Bearer ${newToken}` }
          });
          console.log('[ScriptContent] Retry response status:', res.status);
        }

        if (!res.ok) throw new Error('Failed to fetch scripts');
        
        const data = await res.json();
        console.log('[ScriptContent] Received data:', data);
        console.log('[ScriptContent] Data type:', Array.isArray(data) ? 'array' : typeof data);
        
        // 배열이면 그대로, 객체면 scripts 프로퍼티 찾기
        const scriptsArray = Array.isArray(data) ? data : (data.scripts || []);
        console.log('[ScriptContent] Scripts array:', scriptsArray);
        
        setScripts(scriptsArray);
      } catch (err) {
        console.error('Failed to fetch scripts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScripts();
  }, [accessToken, refresh, logout, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-[#e4e6eb] mb-2">Failed to load scripts</h3>
        <p className="text-[#9ca3af]">{error}</p>
      </div>
    );
  }

  return <ScriptTable scripts={scripts} loading={loading} />;
}
