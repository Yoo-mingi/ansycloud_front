'use client';

import Link from 'next/link';
import { useAuth } from '@/app/providers/AuthProvider';
import { useState } from 'react';

export default function Header() {
  const { accessToken, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  async function handleLogout() {
    await logout();
    window.location.href = '/login';
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0f1419] border-b border-[#2d3748]">
      <div className="px-8 py-5 flex items-center justify-between h-20">
        {/* Logo Section */}
        <div className="flex-shrink-0 mr-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-gradient-to-br from-[#3b82f6] to-[#06b6d4] rounded-lg flex items-center justify-center transform group-hover:scale-110 transition">
              <span className="text-white font-bold text-sm">AC</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] bg-clip-text text-transparent">
              AnsyCloud
            </span>
          </Link>
        </div>

        {/* Center Navigation - Only show when logged in */}
        {accessToken && (
          <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
            <Link
              href="/"
              className="px-3 py-2 text-sm font-medium text-[#9ca3af] hover:text-[#e4e6eb] rounded-md hover:bg-[#252d3d] transition"
            >
              Dashboard
            </Link>
            <Link
              href="/script"
              className="px-3 py-2 text-sm font-medium text-[#9ca3af] hover:text-[#e4e6eb] rounded-md hover:bg-[#252d3d] transition"
            >
              Scripts
            </Link>
            <Link
              href="/community"
              className="px-3 py-2 text-sm font-medium text-[#9ca3af] hover:text-[#e4e6eb] rounded-md hover:bg-[#252d3d] transition"
            >
              Community
            </Link>
            <Link
              href="/site"
              className="px-3 py-2 text-sm font-medium text-[#9ca3af] hover:text-[#e4e6eb] rounded-md hover:bg-[#252d3d] transition"
            >
              Sites
            </Link>
          </nav>
        )}

        {/* Auth Section - Right side */}
        <div className="flex items-center gap-4 ml-auto flex-shrink-0 mr-4">
          {accessToken ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1f2e] hover:bg-[#252d3d] border border-[#2d3748] transition text-sm font-medium"
              >
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#06b6d4] flex items-center justify-center text-white text-sm font-bold">
                  U
                </span>
                <svg className="w-4 h-4 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1a1f2e] border border-[#2d3748] rounded-lg shadow-lg overflow-hidden">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-sm text-[#e4e6eb] hover:bg-[#252d3d] hover:text-[#ef4444] transition font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-[#e4e6eb] hover:text-[#3b82f6] transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-[#3b82f6] hover:bg-[#1e40af] rounded-lg transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}