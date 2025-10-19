'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/app/config';
import { useAuth } from '@/app/providers/AuthProvider';
import Link from 'next/link';

export default function ScriptDashboardContent() {
  const searchParams = useSearchParams();
  const scriptName = searchParams.get('name');
  const router = useRouter();
  const { accessToken, refresh, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [selectedSlaves, setSelectedSlaves] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    if (!scriptName) {
      router.push('/script');
      return;
    }
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptName]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      let res = await fetch(`${API_BASE_URL}/api/script/dashboard?name=${encodeURIComponent(scriptName)}`, {
        headers: {
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        }
      });

      if (res.status === 401) {
        const newToken = await refresh();
        if (!newToken) {
          await logout();
          router.push('/login');
          return;
        }
        res = await fetch(`${API_BASE_URL}/api/script/dashboard?name=${encodeURIComponent(scriptName)}`, {
          headers: { 'Authorization': `Bearer ${newToken}` }
        });
      }

      if (!res.ok) throw new Error('Failed to fetch dashboard data');

      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error('[Dashboard] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMasterToggle = (masterName) => {
    setSelectedMaster(selectedMaster === masterName ? null : masterName);
  };

  const handleSlaveToggle = (ip) => {
    setSelectedSlaves(prev => 
      prev.includes(ip) 
        ? prev.filter(i => i !== ip)
        : [...prev, ip]
    );
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSelectAllSlaves = () => {
    const filteredSlaves = getFilteredSlaves();
    if (selectedSlaves.length === filteredSlaves.length) {
      setSelectedSlaves([]);
    } else {
      setSelectedSlaves(filteredSlaves.map(s => s.ipAddress));
    }
  };

  const getFilteredSlaves = () => {
    if (!dashboardData?.slaveServers) return [];
    
    if (selectedTags.length === 0) {
      return dashboardData.slaveServers;
    }

    return dashboardData.slaveServers.filter(slave =>
      selectedTags.some(tag => slave.tags?.includes(tag))
    );
  };

  const handleExecute = async () => {
    if (!selectedMaster && selectedSlaves.length === 0) {
      alert('Please select at least one server');
      return;
    }

    setExecuting(true);
    try {
      // TODO: WebSocket 연동 예정
      // 지금은 REST API로 실행
      const targets = [];
      
      if (selectedMaster) {
        const master = dashboardData.masterServers.find(m => m.masterName === selectedMaster);
        targets.push({
          type: 'MASTER',
          name: master.masterName,
          ip: master.ipAddress
        });
      }

      selectedSlaves.forEach(slaveIp => {
        const slave = dashboardData.slaveServers.find(s => s.ipAddress === slaveIp);
        targets.push({
          type: 'SLAVE',
          ip: slave.ipAddress,
          description: slave.description
        });
      });

      const res = await fetch(`${API_BASE_URL}/api/script/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
        body: JSON.stringify({
          scriptName,
          targets
        })
      });

      if (!res.ok) throw new Error('Failed to execute script');

      const data = await res.json();
      alert(`Script execution started! Execution ID: ${data.executionId}`);
      
      // 실행 상세 페이지로 이동
      if (data.executionId) {
        router.push(`/script/execution/${data.executionId}`);
      }
    } catch (err) {
      alert(`Execution failed: ${err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6] mx-auto mb-4"></div>
          <p className="text-[#9ca3af]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-[#0f1419] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#7f1d1d] border border-[#ef4444] rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold text-[#fca5a5] mb-2">Failed to load script</h3>
            <p className="text-[#fca5a5] mb-4">{error || 'Script not found'}</p>
            <Link href="/script" className="inline-block px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition">
              Back to Scripts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredSlaves = getFilteredSlaves();

  return (
    <div className="min-h-screen bg-[#0f1419]">
      {/* Header */}
      <div className="border-b border-[#2d3748] bg-[#1a1f2e] px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/script"
            className="text-[#3b82f6] hover:text-[#06b6d4] text-sm mb-3 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Scripts
          </Link>
          
          <div className="flex items-center justify-between mt-2">
            <div>
              <h1 className="text-3xl font-bold text-[#e4e6eb] mb-2">{dashboardData.scriptName}</h1>
              {dashboardData.description && (
                <p className="text-[#9ca3af]">{dashboardData.description}</p>
              )}
              {dashboardData.scriptTag && (
                <div className="flex gap-2 mt-2">
                  {dashboardData.scriptTag.split(',').map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-[#252d3d] text-[#3b82f6] text-xs rounded">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 mt-4 text-sm text-[#9ca3af]">
            <span>Created: {dashboardData.createdAt ? new Date(dashboardData.createdAt).toLocaleString('ko-KR') : 'N/A'}</span>
            <span>•</span>
            <span>Updated: {dashboardData.updatedAt ? new Date(dashboardData.updatedAt).toLocaleString('ko-KR') : 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Execution History (나중에 구현) */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[#e4e6eb] mb-4">Recent Executions</h2>
              <p className="text-sm text-[#6b7280] italic">Coming soon...</p>
            </div>
          </div>

          {/* Main Content - Server Selection & Execute */}
          <div className="lg:col-span-2">
            {/* Master Servers */}
            <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl overflow-hidden mb-6">
              <div className="p-6 border-b border-[#2d3748]">
                <h2 className="text-lg font-semibold text-[#e4e6eb]">Master Servers</h2>
                <p className="text-sm text-[#9ca3af] mt-1">Select master server to execute</p>
              </div>
              <div className="p-6">
                {dashboardData.masterServers?.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.masterServers.map((master, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleMasterToggle(master.masterName)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                          selectedMaster === master.masterName
                            ? 'border-[#3b82f6] bg-[#1e3a8a]/20'
                            : 'border-[#2d3748] hover:border-[#3b82f6]/50 hover:bg-[#252d3d]/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedMaster === master.masterName
                              ? 'border-[#3b82f6] bg-[#3b82f6]'
                              : 'border-[#6b7280]'
                          }`}>
                            {selectedMaster === master.masterName && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#e4e6eb]">{master.masterName}</span>
                              <span className="px-2 py-0.5 bg-[#064e3b] text-[#86efac] text-xs rounded font-semibold">MASTER</span>
                            </div>
                            <p className="text-sm text-[#9ca3af] font-mono mt-1">{master.ipAddress}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#6b7280] italic">No master servers available</p>
                )}
              </div>
            </div>

            {/* Slave Servers */}
            <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl overflow-hidden">
              <div className="p-6 border-b border-[#2d3748]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[#e4e6eb]">Slave Servers</h2>
                    <p className="text-sm text-[#9ca3af] mt-1">
                      {selectedSlaves.length} of {filteredSlaves.length} selected
                    </p>
                  </div>
                  <button
                    onClick={handleSelectAllSlaves}
                    className="px-4 py-2 bg-[#252d3d] hover:bg-[#2d3748] text-[#e4e6eb] text-sm rounded-lg transition"
                  >
                    {selectedSlaves.length === filteredSlaves.length && filteredSlaves.length > 0 ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {/* Tag Filter */}
                {dashboardData.availableTags?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-[#9ca3af] mb-2">Filter by tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {dashboardData.availableTags.map((tag, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleTagToggle(tag)}
                          className={`px-3 py-1.5 text-xs rounded-lg transition ${
                            selectedTags.includes(tag)
                              ? 'bg-[#3b82f6] text-white'
                              : 'bg-[#252d3d] text-[#9ca3af] hover:bg-[#2d3748]'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                      {selectedTags.length > 0 && (
                        <button
                          onClick={() => setSelectedTags([])}
                          className="px-3 py-1.5 text-xs rounded-lg bg-[#7f1d1d] text-[#fca5a5] hover:bg-[#991b1b] transition"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                {filteredSlaves.length > 0 ? (
                  <div className="space-y-2">
                    {filteredSlaves.map((slave, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSlaveToggle(slave.ipAddress)}
                        className={`p-3 border rounded-lg cursor-pointer transition ${
                          selectedSlaves.includes(slave.ipAddress)
                            ? 'border-[#3b82f6] bg-[#1e3a8a]/20'
                            : 'border-[#2d3748] hover:border-[#3b82f6]/50 hover:bg-[#252d3d]/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            selectedSlaves.includes(slave.ipAddress)
                              ? 'border-[#3b82f6] bg-[#3b82f6]'
                              : 'border-[#6b7280]'
                          }`}>
                            {selectedSlaves.includes(slave.ipAddress) && (
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 flex items-center justify-between">
                            <span className="font-mono text-sm text-[#e4e6eb]">{slave.ipAddress}</span>
                            <span className="text-[#6b7280]">|</span>
                            <span className="text-sm text-[#9ca3af] flex-1 ml-3">{slave.description}</span>
                          </div>
                          {slave.tags?.length > 0 && (
                            <div className="flex gap-1">
                              {slave.tags.map((tag, tidx) => (
                                <span key={tidx} className="px-2 py-0.5 bg-[#252d3d] text-[#6b7280] text-xs rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#6b7280] italic">
                    {selectedTags.length > 0 ? 'No servers match the selected tags' : 'No slave servers available'}
                  </p>
                )}
              </div>
            </div>

            {/* Execute Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleExecute}
                disabled={executing || (!selectedMaster && selectedSlaves.length === 0)}
                className="px-8 py-3 bg-[#10b981] hover:bg-[#059669] disabled:bg-[#252d3d] disabled:text-[#6b7280] text-white font-semibold rounded-lg transition disabled:cursor-not-allowed flex items-center gap-2"
              >
                {executing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Executing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Execute Script
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
