'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/app/config';
import { useAuth } from '@/app/providers/AuthProvider';
import Link from 'next/link';

export default function SiteManageContent() {
  const searchParams = useSearchParams();
  const siteName = searchParams.get('name');
  const router = useRouter();
  const { accessToken, refresh, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [siteData, setSiteData] = useState(null);
  
  // Master/Slave 추가 모달
  const [showAddMaster, setShowAddMaster] = useState(false);
  const [showAddSlave, setShowAddSlave] = useState(false);
  const [masterForm, setMasterForm] = useState({ name: '', ip: '' });
  const [slaveForm, setSlaveForm] = useState({ ips: '' });

  useEffect(() => {
    if (!siteName) {
      router.push('/site');
      return;
    }
    fetchSiteData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteName]);

  const fetchSiteData = async () => {
    setLoading(true);
    setError(null);

    try {
      let res = await fetch(`${API_BASE_URL}/api/site/manage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
        body: JSON.stringify({ siteName })
      });

      if (res.status === 401) {
        const newToken = await refresh();
        if (!newToken) {
          await logout();
          router.push('/login');
          return;
        }

        res = await fetch(`${API_BASE_URL}/api/site/manage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`
          },
          body: JSON.stringify({ siteName })
        });
      }

      if (!res.ok) throw new Error('Failed to fetch site data');

      const data = await res.json();
      setSiteData(data);
    } catch (err) {
      console.error('[SiteManage] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaster = async () => {
    if (!masterForm.name.trim() || !masterForm.ip.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/site/master`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
        body: JSON.stringify({
          siteName,
          name: masterForm.name,
          ip: masterForm.ip
        })
      });

      if (!res.ok) throw new Error('Failed to add master server');

      setShowAddMaster(false);
      setMasterForm({ name: '', ip: '' });
      fetchSiteData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddSlaves = async () => {
    if (!slaveForm.ips.trim()) {
      alert('Please enter at least one IP address');
      return;
    }

    if (!siteData?.masterServer) {
      alert('Master server is required before adding slaves');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/site/slave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
        body: JSON.stringify({
          masterId: siteData.masterServer.id,
          ips: slaveForm.ips.split(',').map(ip => ip.trim()).join(',')
        })
      });

      if (!res.ok) throw new Error('Failed to add slave servers');

      setShowAddSlave(false);
      setSlaveForm({ ips: '' });
      fetchSiteData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSite = async () => {
    if (!confirm(`Are you sure you want to delete "${siteName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/site`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
        body: JSON.stringify({ siteName })
      });

      if (!res.ok) throw new Error('Failed to delete site');

      router.push('/site');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f1419] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#7f1d1d] border border-[#ef4444] rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold text-[#fca5a5] mb-2">Error</h3>
            <p className="text-[#fca5a5]">{error}</p>
            <Link href="/site" className="inline-block mt-4 px-4 py-2 bg-[#3b82f6] text-white rounded-lg">
              Back to Sites
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/site" className="text-[#3b82f6] hover:text-[#06b6d4] text-sm mb-2 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Sites
          </Link>
          <h1 className="text-3xl font-bold text-[#e4e6eb] mt-2">Manage Site</h1>
          <p className="text-[#9ca3af] mt-1">Configure and manage your infrastructure site</p>
        </div>

        {/* Installation Script Section (Placeholder) */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#e4e6eb]">Installation Script</h2>
              <p className="text-sm text-[#9ca3af] mt-1">Deploy Ansible and WebSocket configuration to your servers</p>
            </div>
            <button className="px-4 py-2 bg-[#252d3d] text-[#9ca3af] rounded-lg text-sm font-medium cursor-not-allowed" disabled>
              Coming Soon
            </button>
          </div>
          <div className="bg-[#0f1419] border border-[#2d3748] rounded-lg p-8 text-center">
            <svg className="w-16 h-16 text-[#6b7280] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <p className="text-[#6b7280] text-sm">Server installation scripts will be available here</p>
          </div>
        </div>

        {/* Site Information */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#e4e6eb] mb-4">Site Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0f1419] border border-[#2d3748] rounded-lg p-4">
              <label className="text-xs text-[#9ca3af] uppercase tracking-wider">Site Name</label>
              <p className="text-lg font-medium text-[#e4e6eb] mt-1">{siteData?.siteName || siteName}</p>
            </div>
            <div className="bg-[#0f1419] border border-[#2d3748] rounded-lg p-4">
              <label className="text-xs text-[#9ca3af] uppercase tracking-wider">Status</label>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-[#10b981] rounded-full"></div>
                <p className="text-lg font-medium text-[#10b981]">Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Master Server */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#e4e6eb]">Master Server</h2>
            {!siteData?.masterServer && (
              <button
                onClick={() => setShowAddMaster(true)}
                className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium rounded-lg transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Master Server
              </button>
            )}
          </div>

          {siteData?.masterServer ? (
            <div className="bg-[#0f1419] border border-[#2d3748] rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-5 h-5 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                    <h3 className="text-base font-semibold text-[#e4e6eb]">{siteData.masterServer.name}</h3>
                  </div>
                  <p className="text-sm text-[#9ca3af] font-mono ml-8">{siteData.masterServer.ip}</p>
                </div>
                <span className="px-3 py-1 bg-[#064e3b] text-[#86efac] text-xs font-semibold rounded-full">Master</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#0f1419] border border-dashed border-[#2d3748] rounded-lg p-8 text-center">
              <svg className="w-12 h-12 text-[#6b7280] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              <p className="text-[#6b7280] text-sm">No master server configured</p>
            </div>
          )}
        </div>

        {/* Slave Servers */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#e4e6eb]">Slave Servers</h2>
            {siteData?.masterServer && (
              <button
                onClick={() => setShowAddSlave(true)}
                className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium rounded-lg transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Slave Servers
              </button>
            )}
          </div>

          {siteData?.slaveServers && siteData.slaveServers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {siteData.slaveServers.map((slave, idx) => (
                <div key={idx} className="bg-[#0f1419] border border-[#2d3748] rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#e4e6eb]">Slave Server {idx + 1}</p>
                      <p className="text-xs text-[#9ca3af] font-mono mt-1">{slave.ip || slave}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0f1419] border border-dashed border-[#2d3748] rounded-lg p-8 text-center">
              <svg className="w-12 h-12 text-[#6b7280] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-[#6b7280] text-sm">No slave servers configured</p>
              {!siteData?.masterServer && (
                <p className="text-[#6b7280] text-xs mt-2">Add a master server first</p>
              )}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-[#1a1f2e] border border-[#7f1d1d] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[#ef4444] mb-2">Danger Zone</h2>
          <p className="text-sm text-[#9ca3af] mb-4">
            Deleting this site will remove all associated master and slave servers. This action cannot be undone.
          </p>
          <button
            onClick={handleDeleteSite}
            className="px-6 py-2.5 bg-[#7f1d1d] hover:bg-[#991b1b] text-[#fca5a5] font-semibold rounded-lg transition"
          >
            Delete Site
          </button>
        </div>

        {/* Add Master Modal */}
        {showAddMaster && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-[#e4e6eb] mb-4">Add Master Server</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#9ca3af] mb-2">Server Name</label>
                  <input
                    type="text"
                    value={masterForm.name}
                    onChange={(e) => setMasterForm({ ...masterForm, name: e.target.value })}
                    placeholder="e.g., master-01"
                    className="w-full px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] placeholder-[#6b7280] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#9ca3af] mb-2">IP Address</label>
                  <input
                    type="text"
                    value={masterForm.ip}
                    onChange={(e) => setMasterForm({ ...masterForm, ip: e.target.value })}
                    placeholder="e.g., 192.168.1.100"
                    className="w-full px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] placeholder-[#6b7280] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddMaster(false)}
                  className="flex-1 px-4 py-2 bg-[#252d3d] hover:bg-[#2d3748] text-[#e4e6eb] rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMaster}
                  className="flex-1 px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg transition"
                >
                  Add Master
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Slave Modal */}
        {showAddSlave && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-[#e4e6eb] mb-4">Add Slave Servers</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#9ca3af] mb-2">
                    IP Addresses <span className="text-xs">(comma-separated)</span>
                  </label>
                  <textarea
                    value={slaveForm.ips}
                    onChange={(e) => setSlaveForm({ ips: e.target.value })}
                    placeholder="e.g., 192.168.1.101, 192.168.1.102"
                    rows="4"
                    className="w-full px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] placeholder-[#6b7280] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] resize-none"
                  />
                  <p className="text-xs text-[#6b7280] mt-2">Separate multiple IP addresses with commas</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddSlave(false)}
                  className="flex-1 px-4 py-2 bg-[#252d3d] hover:bg-[#2d3748] text-[#e4e6eb] rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSlaves}
                  className="flex-1 px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg transition"
                >
                  Add Slaves
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
