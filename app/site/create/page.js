'use client';

import { useState } from 'react';
import { API_BASE_URL } from '../../config';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { fetchWithAuth } from '@/app/utils/fetchWithAuth';
import Link from 'next/link';

export default function SiteCreatePage() {
  const [form, setForm] = useState({
    siteName: '',
    masterName: '',
    masterIP: '',
    slaveIPs: '', // comma-separated IPs
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // IP 문자열을 정제 (공백 제거, 빈 값 필터링)
  const cleanIPs = (ipString) => {
    return ipString
      .split(',')
      .map(ip => ip.trim())
      .filter(ip => ip.length > 0)
      .join(',');
  };

  const handleCreate = async () => {
    if (!form.siteName.trim()) {
      setError('Site name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create Site (필수)
      console.log('[SiteCreate] Creating site:', form.siteName);
      const siteRes = await fetchWithAuth(`${API_BASE_URL}/api/site/site`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteName: form.siteName }),
      });

      if (!siteRes.ok) {
        const errorData = await siteRes.json();
        throw new Error(errorData.message || 'Failed to create site');
      }

      const siteData = await siteRes.json();
      const siteId = siteData.id || siteData.siteId;
      console.log('[SiteCreate] Site created with ID:', siteId);

      // 2. Create Master Server (선택, name과 ip 모두 있을 때만)
      if (form.masterName.trim() && form.masterIP.trim()) {
        console.log('[SiteCreate] Creating master server:', form.masterName);
        const masterRes = await fetchWithAuth(`${API_BASE_URL}/api/site/master`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siteId: siteId,
            name: form.masterName,
            ip: form.masterIP,
          }),
        });

        if (!masterRes.ok) {
          console.warn('[SiteCreate] Master server creation failed');
          // Master 실패는 경고만 하고 계속 진행
        } else {
          const masterData = await masterRes.json();
          const masterId = masterData.id || masterData.masterId;
          console.log('[SiteCreate] Master server created with ID:', masterId);

          // 3. Create Slave Servers (선택, IP 리스트가 있을 때만)
          if (form.slaveIPs.trim()) {
            const cleanedIPs = cleanIPs(form.slaveIPs);
            if (cleanedIPs) {
              console.log('[SiteCreate] Creating slave servers with IPs:', cleanedIPs);
              const slaveRes = await fetchWithAuth(`${API_BASE_URL}/api/site/slave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  masterId: masterId,
                  ips: cleanedIPs, // "192.168.1.1,192.168.1.2" 형태
                }),
              });

              if (!slaveRes.ok) {
                console.warn('[SiteCreate] Slave servers creation failed');
              } else {
                console.log('[SiteCreate] Slave servers created');
              }
            }
          }
        }
      }

      console.log('[SiteCreate] All creation steps completed');
      router.push('/site');
    } catch (err) {
      console.error('[SiteCreate] Error:', err);
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0f1419] p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#e4e6eb] mb-2">Create Infrastructure Site</h1>
            <p className="text-[#9ca3af]">
              Configure your site and optionally add master and slave servers
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-[#7f1d1d] border border-[#ef4444] text-[#fca5a5] rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form Card */}
          <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-8">
            {/* Site Name (필수) */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-[#e4e6eb] mb-3">
                Site Name <span className="text-[#ef4444]">*</span>
              </label>
              <input
                type="text"
                value={form.siteName}
                onChange={(e) => setForm((f) => ({ ...f, siteName: e.target.value }))}
                placeholder="e.g., Production Environment"
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] placeholder-[#6b7280] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                disabled={loading}
              />
              <p className="mt-2 text-xs text-[#9ca3af]">
                Required. Give your infrastructure site a descriptive name.
              </p>
            </div>

            <div className="border-t border-[#2d3748] my-8"></div>

            {/* Master Server (선택) */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[#e4e6eb] mb-4">
                Master Server <span className="text-xs text-[#9ca3af] font-normal">(Optional)</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#9ca3af] mb-2">
                    Server Name
                  </label>
                  <input
                    type="text"
                    value={form.masterName}
                    onChange={(e) => setForm((f) => ({ ...f, masterName: e.target.value }))}
                    placeholder="e.g., master-01"
                    className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] placeholder-[#6b7280] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#9ca3af] mb-2">
                    IP Address
                  </label>
                  <input
                    type="text"
                    value={form.masterIP}
                    onChange={(e) => setForm((f) => ({ ...f, masterIP: e.target.value }))}
                    placeholder="e.g., 192.168.1.100"
                    className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] placeholder-[#6b7280] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[#2d3748] my-8"></div>

            {/* Slave Servers (선택) */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[#e4e6eb] mb-4">
                Slave Servers <span className="text-xs text-[#9ca3af] font-normal">(Optional)</span>
              </h3>

              {!form.masterName.trim() && !form.masterIP.trim() && (
                <p className="text-xs text-[#9ca3af] mb-4">
                  💡 Master server is required before adding slave servers.
                </p>
              )}

              <div>
                <label className="block text-sm font-medium text-[#9ca3af] mb-2">
                  Slave IP Addresses <span className="text-xs">(comma-separated)</span>
                </label>
                <textarea
                  value={form.slaveIPs}
                  onChange={(e) => setForm((f) => ({ ...f, slaveIPs: e.target.value }))}
                  placeholder="e.g., 192.168.1.101, 192.168.1.102, 192.168.1.103"
                  rows="3"
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] placeholder-[#6b7280] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] resize-none"
                  disabled={loading || (!form.masterName.trim() && !form.masterIP.trim())}
                />
                <p className="mt-2 text-xs text-[#6b7280]">
                  Separate multiple IP addresses with commas. Spaces will be automatically trimmed.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-[#2d3748]">
              <Link
                href="/site"
                className="px-6 py-3 bg-[#252d3d] hover:bg-[#2d3748] text-[#e4e6eb] font-semibold rounded-lg transition border border-[#2d3748]"
              >
                Cancel
              </Link>
              <button
                onClick={handleCreate}
                disabled={loading || !form.siteName.trim()}
                className="px-6 py-3 bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] hover:from-[#1e40af] hover:to-[#0891b2] disabled:from-[#6b7280] disabled:to-[#4b5563] text-white font-semibold rounded-lg transition transform hover:scale-105 disabled:hover:scale-100"
              >
                {loading ? 'Creating...' : 'Create Site'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
