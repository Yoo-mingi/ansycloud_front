'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { initAuthContext } from '@/app/utils/fetchWithAuth';

const AuthContext = createContext({
  accessToken: null,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  refresh: async () => {}
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = 'http://localhost:8080/api/auth';

  // 초기 로드 시 localStorage에서 로그인 상태 확인
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    console.log('[AuthProvider] Stored auth status:', authStatus);
    
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      // 백그라운드에서 토큰 갱신 (조용히 실패 처리)
      refresh().catch(() => {
        console.log('[AuthProvider] Initial refresh failed, but keeping auth state');
      });
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  async function refresh() {
    try {
      const res = await fetch(`${API_BASE}/refresh`, {
        method: 'POST',
        credentials: 'include' // 쿠키(리프레시 토큰) 자동 전송
      });
      
      if (!res.ok) {
        console.log('[AuthProvider] Refresh failed - status:', res.status);
        // refresh 실패 시 null 반환만 하고, 로그아웃은 호출한 쪽에서 처리
        return null;
      }
      
      const data = await res.json();
      console.log('[AuthProvider] Refresh response data:', data);
      
      // 백엔드 응답 구조: { status: "success", jwtToken: "..." }
      const token = data.jwtToken || data.message || data.accessToken || data.token;
      console.log('[AuthProvider] Extracted token from refresh:', token);
      
      setAccessToken(token);
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      console.log('[AuthProvider] Access token refreshed successfully');
      return token;
    } catch (e) {
      console.error('[AuthProvider] Refresh error:', e);
      return null;
    }
  }

  async function login(credentials) {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        credentials: 'include', // 쿠키 수신 위해 포함
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      if (!res.ok) {
        throw new Error('Login failed');
      }
      const data = await res.json();
      console.log('[AuthProvider] Login response data:', data);
      
      // 백엔드 응답 구조: { status: "success", jwtToken: "..." }
      const token = data.jwtToken || data.message || data.accessToken || data.token;
      console.log('[AuthProvider] Extracted token:', token);
      
      // 로그인 성공 시 상태 저장
      setAccessToken(token);
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      console.log('[AuthProvider] Login successful, auth status saved');
      return data;
    } catch (e) {
      console.error('Login error:', e);
      throw e;
    }
  }

  async function logout() {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setAccessToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem('isAuthenticated');
      console.log('[AuthProvider] Logged out, auth status cleared');
    }
  }

  // fetchWithAuth에서 사용할 수 있도록 auth context 초기화
  useEffect(() => {
    initAuthContext({ accessToken, refresh, logout });
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ accessToken, isAuthenticated, login, logout, refresh, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}