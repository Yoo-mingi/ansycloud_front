'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/app/config';
import { useAuth } from '@/app/providers/AuthProvider';
import Link from 'next/link';

export default function ExecutionHistoryContent() {
  const searchParams = useSearchParams();
  const scriptName = searchParams.get('name');
  const router = useRouter();
  const { accessToken, refresh, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [executions, setExecutions] = useState([]);
  const [pagination, setPagination] = useState(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all'); // all, success, failure, running
  const [dateRange, setDateRange] = useState('7days'); // 7days, 30days, 90days, all
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedExecutions, setSelectedExecutions] = useState([]);

  useEffect(() => {
    if (!scriptName) {
      router.push('/script');
      return;
    }
    fetchExecutions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptName, statusFilter, dateRange, currentPage]);

  const fetchExecutions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        name: scriptName,
        page: currentPage.toString(),
        status: statusFilter,
        dateRange: dateRange
      });

      let res = await fetch(`${API_BASE_URL}/api/script/executions?${params}`, {
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
        res = await fetch(`${API_BASE_URL}/api/script/executions?${params}`, {
          headers: { 'Authorization': `Bearer ${newToken}` }
        });
      }

      if (!res.ok) throw new Error('Failed to fetch executions');

      const data = await res.json();
      setExecutions(data.executions || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error('[ExecutionHistory] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLog = async (executionId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/script/execution/${executionId}/download`, {
        headers: {
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        }
      });

      if (!res.ok) throw new Error('Failed to download log');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `execution-${executionId}.log`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams({
        name: scriptName,
        status: statusFilter,
        dateRange: dateRange,
        format: 'csv'
      });

      const res = await fetch(`${API_BASE_URL}/api/script/executions/export?${params}`, {
        headers: {
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        }
      });

      if (!res.ok) throw new Error('Failed to export data');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${scriptName}-executions.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedExecutions.length === 0) {
      alert('Please select executions to delete');
      return;
    }

    if (!confirm(`Delete ${selectedExecutions.length} execution(s)? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/script/executions/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
        body: JSON.stringify({ executionIds: selectedExecutions })
      });

      if (!res.ok) throw new Error('Failed to delete executions');

      setSelectedExecutions([]);
      fetchExecutions();
      alert('Executions deleted successfully');
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleSelection = (executionId) => {
    setSelectedExecutions(prev =>
      prev.includes(executionId)
        ? prev.filter(id => id !== executionId)
        : [...prev, executionId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedExecutions.length === executions.length) {
      setSelectedExecutions([]);
    } else {
      setSelectedExecutions(executions.map(e => e.executionId));
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1419] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/script/manage?name=${encodeURIComponent(scriptName)}`}
            className="text-[#3b82f6] hover:text-[#06b6d4] text-sm mb-2 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between mt-2">
            <div>
              <h1 className="text-3xl font-bold text-[#e4e6eb]">Execution History</h1>
              <p className="text-[#9ca3af] mt-1">Script: <span className="font-semibold">{scriptName}</span></p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-[#252d3d] hover:bg-[#2d3748] text-[#e4e6eb] rounded-lg transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
              {selectedExecutions.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-4 py-2 bg-[#7f1d1d] hover:bg-[#991b1b] text-[#fca5a5] rounded-lg transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete ({selectedExecutions.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-[#e4e6eb] mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
                <option value="running">Running</option>
                <option value="aborted">Aborted</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-semibold text-[#e4e6eb] mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => { setDateRange(e.target.value); setCurrentPage(1); }}
                className="w-full px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>

            {/* Results Info */}
            <div className="flex items-end">
              <div className="text-sm text-[#9ca3af]">
                {pagination && (
                  <p>
                    Showing {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, pagination.totalItems)} of {pagination.totalItems} executions
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Execution List */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6] mx-auto mb-4"></div>
              <p className="text-[#9ca3af]">Loading executions...</p>
            </div>
          ) : executions.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-[#6b7280] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-semibold text-[#e4e6eb] mb-2">No Executions Found</h3>
              <p className="text-[#9ca3af]">Try adjusting your filters or run the script to create executions</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-[#252d3d] border-b border-[#2d3748]">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedExecutions.length === executions.length && executions.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-[#3b82f6] bg-[#0f1419] border-[#2d3748] rounded focus:ring-[#3b82f6]"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#9ca3af] uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#9ca3af] uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#9ca3af] uppercase">Started</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#9ca3af] uppercase">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#9ca3af] uppercase">Targets</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#9ca3af] uppercase">Success Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#9ca3af] uppercase">Executed By</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#9ca3af] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2d3748]">
                  {executions.map((exec) => (
                    <tr key={exec.executionId} className="hover:bg-[#252d3d]/50 transition">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedExecutions.includes(exec.executionId)}
                          onChange={() => toggleSelection(exec.executionId)}
                          className="w-4 h-4 text-[#3b82f6] bg-[#0f1419] border-[#2d3748] rounded focus:ring-[#3b82f6]"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/script/execution/${exec.executionId}`}
                          className="text-[#3b82f6] hover:text-[#06b6d4] font-mono font-semibold"
                        >
                          #{exec.executionId}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {exec.status === 'SUCCESS' ? (
                            <svg className="w-5 h-5 text-[#10b981]" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" />
                            </svg>
                          ) : exec.status === 'FAILURE' ? (
                            <svg className="w-5 h-5 text-[#ef4444]" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" />
                            </svg>
                          ) : exec.status === 'RUNNING' ? (
                            <svg className="w-5 h-5 text-[#3b82f6] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          ) : exec.status === 'ABORTED' ? (
                            <svg className="w-5 h-5 text-[#f59e0b]" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-[#6b7280]" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" />
                            </svg>
                          )}
                          <span className={`text-sm font-medium ${
                            exec.status === 'SUCCESS' ? 'text-[#10b981]' :
                            exec.status === 'FAILURE' ? 'text-[#ef4444]' :
                            exec.status === 'RUNNING' ? 'text-[#3b82f6]' :
                            exec.status === 'ABORTED' ? 'text-[#f59e0b]' :
                            'text-[#6b7280]'
                          }`}>
                            {exec.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#9ca3af]">{exec.startedAt}</td>
                      <td className="px-6 py-4 text-sm text-[#e4e6eb] font-mono">{exec.duration || '--'}</td>
                      <td className="px-6 py-4 text-sm text-[#9ca3af]">{exec.targetServers}</td>
                      <td className="px-6 py-4">
                        {exec.successCount !== undefined && exec.totalCount ? (
                          <span className={`text-sm ${
                            exec.successCount === exec.totalCount ? 'text-[#10b981]' : 'text-[#f59e0b]'
                          }`}>
                            {exec.successCount}/{exec.totalCount}
                          </span>
                        ) : (
                          <span className="text-sm text-[#6b7280]">--</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#9ca3af]">{exec.executedBy}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDownloadLog(exec.executionId)}
                          className="text-[#3b82f6] hover:text-[#06b6d4] transition"
                          title="Download Log"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="p-6 border-t border-[#2d3748] flex items-center justify-between">
                  <div className="text-sm text-[#9ca3af]">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={!pagination.hasPrevious || currentPage === 1}
                      className="px-4 py-2 bg-[#252d3d] hover:bg-[#2d3748] disabled:bg-[#1a1f2e] disabled:text-[#6b7280] text-[#e4e6eb] rounded-lg transition disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                      disabled={!pagination.hasNext || currentPage === pagination.totalPages}
                      className="px-4 py-2 bg-[#252d3d] hover:bg-[#2d3748] disabled:bg-[#1a1f2e] disabled:text-[#6b7280] text-[#e4e6eb] rounded-lg transition disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
