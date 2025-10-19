// API 요청 래퍼: 401 에러 시 자동으로 refresh 시도
// 사용법: import { fetchWithAuth } from '@/app/utils/fetchWithAuth';
//        const data = await fetchWithAuth('/api/site/site', { method: 'GET' });

let authContextRef = null;

export function initAuthContext(authContext) {
  authContextRef = authContext;
}

export async function fetchWithAuth(url, options = {}) {
  if (!authContextRef) {
    throw new Error('Auth context not initialized. Call initAuthContext() first.');
  }

  const { accessToken, refresh, logout } = authContextRef;
  
  console.log('[fetchWithAuth] URL:', url);
  console.log('[fetchWithAuth] Access token:', accessToken);
  
  // 첫 번째 요청 시도
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
  };

  console.log('[fetchWithAuth] Request headers:', headers);

  let response = await fetch(url, { ...options, headers });
  
  console.log('[fetchWithAuth] Response status:', response.status);

  // 401 에러면 refresh 시도
  if (response.status === 401) {
    console.log('[fetchWithAuth] 401 error, attempting refresh...');
    const newToken = await refresh();
    console.log('[fetchWithAuth] New token after refresh:', newToken);
    
    if (!newToken) {
      console.log('[fetchWithAuth] Refresh failed, logging out...');
      await logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Authentication failed');
    }

    // 새 토큰으로 재시도
    headers['Authorization'] = `Bearer ${newToken}`;
    console.log('[fetchWithAuth] Retrying with new token...');
    response = await fetch(url, { ...options, headers });
    console.log('[fetchWithAuth] Retry response status:', response.status);
  }

  return response;
}
