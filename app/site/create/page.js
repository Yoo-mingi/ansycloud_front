'use client';

import { useState } from 'react';
import { API_BASE_URL } from '../../config';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import Link from 'next/link';

export default function SiteCreatePage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    masterNodeName: '',
    masterNodeIP: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleNext = () => {
    if (!form.name.trim()) {
      setError('Site name is required');
      return;
    }
    setError('');
    setStep((s) => Math.min(s + 1, 1));
  };

  const handleBack = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleCreate = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/site/site`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          masterNodeName: form.masterNodeName,
          masterNodeIP: form.masterNodeIP,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create site');
      }

      router.push('/site');
    } catch (err) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0f1419] p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#e4e6eb] mb-2">Create Infrastructure Site</h1>
            <p className="text-[#9ca3af]">
              Step {step + 1} of 2
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8 bg-[#252d3d] rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] h-full transition-all duration-300"
              style={{ width: `${((step + 1) / 2) * 100}%` }}
            ></div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-[#7f1d1d] border border-[#ef4444] text-[#fca5a5] rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form Card */}
          <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-8">
            {/* Step 1: Site Info */}
            {step === 0 && (
              <div>
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-[#e4e6eb] mb-3">
                    Site Name <span className="text-[#ef4444]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="e.g., Production Environment"
                    className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] placeholder-[#6b7280] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                    disabled={loading}
                  />
                </div>

                <p className="text-sm text-[#9ca3af] mb-6">
                  Give your infrastructure site a descriptive name to easily identify it.
                </p>

                <div className="flex justify-end gap-3">
                  <Link
                    href="/site"
                    className="px-6 py-3 bg-[#252d3d] hover:bg-[#2d3748] text-[#e4e6eb] font-semibold rounded-lg transition border border-[#2d3748]"
                  >
                    Cancel
                  </Link>
                  <button
                    onClick={handleNext}
                    disabled={loading || !form.name.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] hover:from-[#1e40af] hover:to-[#0891b2] disabled:from-[#6b7280] disabled:to-[#4b5563] text-white font-semibold rounded-lg transition transform hover:scale-105 disabled:hover:scale-100"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Master Node Info */}
            {step === 1 && (
              <div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-[#e4e6eb] mb-3">
                    Master Node Name
                  </label>
                  <input
                    type="text"
                    value={form.masterNodeName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, masterNodeName: e.target.value }))
                    }
                    placeholder="e.g., master-01"
                    className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] placeholder-[#6b7280] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                    disabled={loading}
                  />
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-semibold text-[#e4e6eb] mb-3">
                    Master Node IP Address
                  </label>
                  <input
                    type="text"
                    value={form.masterNodeIP}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, masterNodeIP: e.target.value }))
                    }
                    placeholder="e.g., 192.168.1.100"
                    className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] placeholder-[#6b7280] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                    disabled={loading}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleBack}
                    disabled={loading}
                    className="px-6 py-3 bg-[#252d3d] hover:bg-[#2d3748] text-[#e4e6eb] font-semibold rounded-lg transition border border-[#2d3748]"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] hover:from-[#1e40af] hover:to-[#0891b2] disabled:from-[#6b7280] disabled:to-[#4b5563] text-white font-semibold rounded-lg transition transform hover:scale-105 disabled:hover:scale-100"
                  >
                    {loading ? 'Creating...' : 'Create Site'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
