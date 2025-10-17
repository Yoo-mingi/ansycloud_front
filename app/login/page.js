'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ username, password });
      router.push('/');
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1419] p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#3b82f6] rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#06b6d4] rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-[#1a1f2e] rounded-2xl border border-[#2d3748] p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#3b82f6] to-[#06b6d4] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">AC</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[#e4e6eb] mb-2">Welcome Back</h1>
            <p className="text-[#9ca3af] text-sm">Sign in to your AnsyCloud account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-[#7f1d1d] border border-[#ef4444] text-[#fca5a5] rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#e4e6eb] mb-2">
                Email
              </label>
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] placeholder-[#6b7280] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#e4e6eb] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] placeholder-[#6b7280] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] hover:from-[#1e40af] hover:to-[#0891b2] disabled:from-[#6b7280] disabled:to-[#4b5563] text-white font-semibold py-3 px-4 rounded-lg transition transform hover:scale-105 disabled:hover:scale-100"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-[#2d3748]"></div>
            <span className="text-[#6b7280] text-sm">New to AnsyCloud?</span>
            <div className="flex-1 h-px bg-[#2d3748]"></div>
          </div>

          {/* Sign Up Link */}
          <Link
            href="/register"
            className="block w-full text-center px-4 py-3 border border-[#2d3748] rounded-lg text-[#3b82f6] hover:bg-[#252d3d] font-semibold transition"
          >
            Create Account
          </Link>
        </div>

        {/* Footer Text */}
        <p className="text-center text-[#6b7280] text-xs mt-6">
          The Open Source Pipeline Automation Platform
        </p>
      </div>
    </div>
  );
}
