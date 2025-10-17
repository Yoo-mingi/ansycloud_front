'use client';

import { useState } from 'react';
import { API_BASE_URL } from '../../config';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import Link from 'next/link';

export default function ScriptCreatePage() {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSave = async () => {
    if (!name.trim() || !content.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content }),
      });

      if (!res.ok) {
        throw new Error('Failed to create script');
      }

      router.push('/script');
    } catch (err) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0f1419] p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#e4e6eb] mb-2">Create Script</h1>
            <p className="text-[#9ca3af]">Create a new automation script</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-[#7f1d1d] border border-[#ef4444] text-[#fca5a5] rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form Card */}
          <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-8">
            {/* Name Field */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#e4e6eb] mb-3">
                Script Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Deploy Application"
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] placeholder-[#6b7280] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                disabled={loading}
              />
            </div>

            {/* Content Field */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-[#e4e6eb] mb-3">
                Script Content (YAML)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your Ansible YAML script here..."
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] placeholder-[#6b7280] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] font-mono min-h-[300px]"
                disabled={loading}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Link
                href="/script"
                className="px-6 py-3 bg-[#252d3d] hover:bg-[#2d3748] text-[#e4e6eb] font-semibold rounded-lg transition border border-[#2d3748]"
              >
                Cancel
              </Link>
              <button
                onClick={handleSave}
                disabled={loading || !name.trim() || !content.trim()}
                className="px-6 py-3 bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] hover:from-[#1e40af] hover:to-[#0891b2] disabled:from-[#6b7280] disabled:to-[#4b5563] text-white font-semibold rounded-lg transition transform hover:scale-105 disabled:hover:scale-100"
              >
                {loading ? 'Creating...' : 'Create Script'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
