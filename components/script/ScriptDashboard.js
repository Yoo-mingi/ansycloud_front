'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/app/config';
import { useAuth } from '@/app/providers/AuthProvider';
import Link from 'next/link';
import ServerSelector from './ServerSelector';
import ScriptEditModal from './ScriptEditModal';
import ScriptExecutionHistory from './ScriptExecutionHistory';

export default function ScriptDashboard() {
  const searchParams = useSearchParams();
  const scriptName = searchParams.get('name');
  const router = useRouter();
  const { accessToken, refresh, logout } = useAuth();

  // Dashboard data
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  // UI states
  const [activeTab, setActiveTab] = useState('overview'); // overview, history
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedServers, setSelectedServers] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

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
      let res = await fetch(`${API_BASE_URL}/api/script/dashboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
        body: JSON.stringify({ scriptName })
      });

      if (res.status === 401) {
        const newToken = await refresh();
        if (!newToken) {
          await logout();
          router.push('/login');
          return;
        }
        res = await fetch(`${API_BASE_URL}/api/script/dashboard`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`
          },
          body: JSON.stringify({ scriptName })
        });
      }

      if (!res.ok) throw new Error('Failed to fetch dashboard data');

      const data = await res.json();
      setDashboardData(data);
      
      // 실행 중인 작업이 있으면 상태 설정
      if (data.runningExecution) {
        setIsRunning(true);
      }
    } catch (err) {
      console.error('[ScriptDashboard] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunScript = async (dryRun = false) => {
    if (selectedServers.length === 0) {
      alert('Please select at least one server');
      return;
    }

    setIsRunning(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/script/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
        body: JSON.stringify({
          scriptName,
          servers: selectedServers,
          dryRun
        })
      });

      if (!res.ok) throw new Error('Failed to execute script');

      const result = await res.json();
      
      // 실행 시작되면 대시보드 새로고침
      await fetchDashboardData();
      
      alert(dryRun ? 'Dry run started' : 'Script execution started');
    } catch (err) {
      alert(err.message);
      setIsRunning(false);
    }
  };

  const handleAbort = async () => {
    if (!dashboardData?.runningExecution) return;

    if (!confirm('Are you sure you want to abort the running execution?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/script/abort`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
        body: JSON.stringify({
          executionId: dashboardData.runningExecution.executionId
        })
      });

      if (!res.ok) throw new Error('Failed to abort execution');

      await fetchDashboardData();
      setIsRunning(false);
      alert('Execution aborted');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/script/script`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
        body: JSON.stringify({ scriptName })
      });

      if (!res.ok) throw new Error('Failed to delete script');

      router.push('/script');
    } catch (err) {
      alert(err.message);
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
            <h3 className="text-xl font-semibold text-[#fca5a5] mb-2">Error</h3>
            <p className="text-[#fca5a5] mb-4">{error || 'Failed to load dashboard'}</p>
            <Link href="/script" className="inline-block px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition">
              Back to Scripts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardData.stats || {};
  const runningExecution = dashboardData.runningExecution;

  return (
    <div className="min-h-screen bg-[#0f1419]">
      <div className="flex">
        {/* Left Sidebar - Jenkins Style */}
        <div className="w-64 bg-[#1a1f2e] border-r border-[#2d3748] min-h-screen p-6">
          <div className="mb-8">
            <Link href="/script" className="text-[#3b82f6] hover:text-[#06b6d4] text-sm flex items-center gap-1 mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Scripts
            </Link>
            <h2 className="text-lg font-bold text-[#e4e6eb] break-words">{dashboardData.scriptName}</h2>
            {dashboardData.description && (
              <p className="text-sm text-[#9ca3af] mt-2">{dashboardData.description}</p>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-1 mb-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'overview'
                  ? 'bg-[#3b82f6] text-white'
                  : 'text-[#9ca3af] hover:bg-[#252d3d]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'history'
                  ? 'bg-[#3b82f6] text-white'
                  : 'text-[#9ca3af] hover:bg-[#252d3d]'
              }`}
            >
              Execution History
            </button>
          </nav>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="w-full px-4 py-2 bg-[#252d3d] hover:bg-[#2d3748] text-[#e4e6eb] text-sm font-medium rounded-lg transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Script
            </button>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full px-4 py-2 bg-[#7f1d1d] hover:bg-[#991b1b] text-[#fca5a5] text-sm font-medium rounded-lg transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Script
            </button>
          </div>

          {/* Execution Stats */}
          <div className="mt-8 pt-8 border-t border-[#2d3748]">
            <h3 className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-4">Statistics</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-[#6b7280]">Total Executions</div>
                <div className="text-lg font-bold text-[#e4e6eb]">{stats.totalExecutions || 0}</div>
              </div>
              <div>
                <div className="text-xs text-[#6b7280]">Success Rate</div>
                <div className="text-lg font-bold text-[#10b981]">{stats.successRate || 0}%</div>
              </div>
              <div>
                <div className="text-xs text-[#6b7280]">Avg Duration</div>
                <div className="text-lg font-bold text-[#e4e6eb]">{stats.averageDuration || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === 'overview' ? (
            <div>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#e4e6eb] mb-2">{dashboardData.scriptName}</h1>
                <p className="text-[#9ca3af]">Select target servers and execute your automation script</p>
                {dashboardData.updatedAt && (
                  <p className="text-sm text-[#6b7280] mt-1">Last updated: {dashboardData.updatedAt}</p>
                )}
              </div>

              {/* Running Execution Alert */}
              {runningExecution && (
                <div className="mb-6 bg-[#1e40af] border border-[#3b82f6] rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <div>
                      <div className="text-sm font-semibold text-white">Execution in Progress</div>
                      <div className="text-xs text-[#93c5fd]">
                        Started: {runningExecution.startedAt} • Target: {runningExecution.targetServers}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleAbort}
                    className="px-4 py-2 bg-[#7f1d1d] hover:bg-[#991b1b] text-white text-sm font-medium rounded-lg transition"
                  >
                    Abort
                  </button>
                </div>
              )}

              {/* Server Selector */}
              <ServerSelector
                servers={dashboardData.availableServers || []}
                selectedServers={selectedServers}
                onSelectionChange={setSelectedServers}
              />

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleRunScript(false)}
                  disabled={isRunning || selectedServers.length === 0}
                  className="px-6 py-3 bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#6b7280] text-white font-semibold rounded-lg transition disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Run Script
                </button>
                
                <button
                  onClick={() => handleRunScript(true)}
                  disabled={isRunning || selectedServers.length === 0}
                  className="px-6 py-3 bg-[#252d3d] hover:bg-[#2d3748] disabled:bg-[#6b7280] text-[#e4e6eb] font-medium rounded-lg transition disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Dry Run (Check Mode)
                </button>
              </div>

              {/* Recent Executions Preview */}
              {dashboardData.recentExecutions && dashboardData.recentExecutions.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-[#e4e6eb]">Recent Executions</h2>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="text-[#3b82f6] hover:text-[#06b6d4] text-sm font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-[#252d3d] border-b border-[#2d3748]">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[#9ca3af] uppercase">ID</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[#9ca3af] uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[#9ca3af] uppercase">Started</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[#9ca3af] uppercase">Duration</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[#9ca3af] uppercase">By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2d3748]">
                        {dashboardData.recentExecutions.slice(0, 5).map((exec) => (
                          <tr key={exec.executionId} className="hover:bg-[#252d3d]/50 transition">
                            <td className="px-4 py-3 text-sm text-[#e4e6eb]">#{exec.executionId}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                exec.status === 'SUCCESS' ? 'bg-[#064e3b] text-[#86efac]' :
                                exec.status === 'FAILURE' ? 'bg-[#7f1d1d] text-[#fca5a5]' :
                                exec.status === 'RUNNING' ? 'bg-[#1e40af] text-[#93c5fd]' :
                                'bg-[#374151] text-[#9ca3af]'
                              }`}>
                                {exec.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-[#9ca3af]">{exec.startedAt}</td>
                            <td className="px-4 py-3 text-sm text-[#9ca3af]">{exec.duration || '--'}</td>
                            <td className="px-4 py-3 text-sm text-[#9ca3af]">{exec.executedBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <ScriptExecutionHistory scriptName={scriptName} />
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <ScriptEditModal
          scriptName={scriptName}
          onClose={() => setShowEditModal(false)}
          onSaved={fetchDashboardData}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f2e] border border-[#7f1d1d] rounded-xl p-6 max-w-md w-full">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-[#7f1d1d] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#fca5a5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#e4e6eb] mb-2">Delete Script</h3>
                <p className="text-[#9ca3af] text-sm">
                  Are you sure you want to delete <span className="font-semibold text-[#e4e6eb]">&ldquo;{scriptName}&rdquo;</span>? 
                  All execution history will be permanently removed.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-[#252d3d] hover:bg-[#2d3748] text-[#e4e6eb] font-medium rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-[#7f1d1d] hover:bg-[#991b1b] text-[#fca5a5] font-semibold rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
