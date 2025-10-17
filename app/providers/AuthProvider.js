'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext({
  accessToken: null,
  login: async () => {},
  logout: async () => {},
  refresh: async () => {}
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = 'http://localhost:8080/api';

  // 페이지 로드 시 refresh 시도 -> 메모리에 access 채움
  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include' // 쿠키(리프레시 토큰) 자동 전송
      });
      if (!res.ok) {
        setAccessToken(null);
        setIsLoading(false);
        return null;
      }
      const data = await res.json();
      setAccessToken(data.accessToken);
      setIsLoading(false);
      return data.accessToken;
    } catch (e) {
      console.error('Refresh failed:', e);
      setAccessToken(null);
      setIsLoading(false);
      return null;
    }
  }

  async function login(credentials) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        credentials: 'include', // 쿠키 수신 위해 포함
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      if (!res.ok) {
        throw new Error('Login failed');
      }
      const data = await res.json();
      // 서버가 Set-Cookie로 refreshToken을 내려주고 body로 accessToken 반환한다고 가정
      setAccessToken(data.accessToken);
      return data;
    } catch (e) {
      console.error('Login error:', e);
      throw e;
    }
  }

  async function logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setAccessToken(null);
    }
  }

  return (
    <AuthContext.Provider value={{ accessToken, login, logout, refresh, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}