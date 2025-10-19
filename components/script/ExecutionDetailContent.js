'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { API_BASE_URL } from '@/app/config';
import { useAuth } from '@/app/providers/AuthProvider';
import Link from 'next/link';

export default function ExecutionDetailContent() {
  const params = useParams();
  const executionId = params.id;
  const router = useRouter();
  const { accessToken, refresh, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [execution, setExecution] = useState(null);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [wrapText, setWrapText] = useState(true);
  const [shareToken, setShareToken] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (executionId) {
      fetchExecutionDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executionId]);

  const fetchExecutionDetail = async () => {
    setLoading(true);
    try {
      let res = await fetch(`${API_BASE_URL}/api/script/execution/${executionId}`, {
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
        res = await fetch(`${API_BASE_URL}/api/script/execution/${executionId}`, {
          headers: { 'Authorization': `Bearer ${newToken}` }
        });
      }

      if (!res.ok) throw new Error('Failed to fetch execution detail');

      const data = await res.json();
      setExecution(data);
    } catch (err) {
      console.error('[ExecutionDetail] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLog = () => {
    if (!execution) return;

    const fullLog = execution.serverResults
      .map(server => 
        `===== Server: ${server.serverName} (${server.ip}) =====\n` +
        `Status: ${server.status}\n` +
        `Return Code: ${server.returnCode}\n` +
        `Duration: ${server.duration}\n\n` +
        `${server.output}\n\n`
      )
      .join('\n');

    const blob = new Blob([fullLog], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `execution-${executionId}.log`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleReRun = async () => {
    if (!execution) return;

    if (!confirm('Re-run this script with the same servers?')) return;

    try {
      const targets = execution.serverResults.map(server => ({
        serverType: server.serverType || 'MASTER',
        serverId: server.serverId
      }));

      const res = await fetch(`${API_BASE_URL}/api/script/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
        body: JSON.stringify({
          scriptName: execution.scriptName,
          targets
        })
      });

      if (!res.ok) throw new Error('Failed to re-run script');

      const data = await res.json();
      alert('Script execution started');
      
      // 새 실행 페이지로 이동
      if (data.executionId) {
        router.push(`/script/execution/${data.executionId}`);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGenerateShareLink = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/script/execution/${executionId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        }
      });

      if (!res.ok) throw new Error('Failed to generate share link');

      const data = await res.json();
      setShareToken(data.shareToken);
      setShowShareModal(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/script/execution/shared/${shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  };

  const navigateTo = (targetExecutionId) => {
    if (targetExecutionId) {
      router.push(`/script/execution/${targetExecutionId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6] mx-auto mb-4"></div>
          <p className="text-[#9ca3af]">Loading execution details...</p>
        </div>
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="min-h-screen bg-[#0f1419] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#7f1d1d] border border-[#ef4444] rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold text-[#fca5a5] mb-2">Execution Not Found</h3>
            <p className="text-[#fca5a5] mb-4">The execution you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/script" className="inline-block px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition">
              Back to Scripts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/script/manage?name=${encodeURIComponent(execution.scriptName)}`}
            className="text-[#3b82f6] hover:text-[#06b6d4] text-sm mb-2 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between mt-2">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-[#e4e6eb]">Execution #{executionId}</h1>
                {execution.status === 'SUCCESS' ? (
                  <span className="px-3 py-1 bg-[#064e3b] text-[#10b981] text-sm font-semibold rounded-full">SUCCESS</span>
                ) : execution.status === 'FAILURE' ? (
                  <span className="px-3 py-1 bg-[#7f1d1d] text-[#ef4444] text-sm font-semibold rounded-full">FAILURE</span>
                ) : execution.status === 'RUNNING' ? (
                  <span className="px-3 py-1 bg-[#1e3a8a] text-[#3b82f6] text-sm font-semibold rounded-full">RUNNING</span>
                ) : execution.status === 'ABORTED' ? (
                  <span className="px-3 py-1 bg-[#78350f] text-[#f59e0b] text-sm font-semibold rounded-full">ABORTED</span>
                ) : (
                  <span className="px-3 py-1 bg-[#252d3d] text-[#6b7280] text-sm font-semibold rounded-full">{execution.status}</span>
                )}
              </div>
              <p className="text-[#9ca3af] mt-1">Script: <Link href={`/script/manage?name=${encodeURIComponent(execution.scriptName)}`} className="text-[#3b82f6] hover:text-[#06b6d4] font-semibold">{execution.scriptName}</Link></p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadLog}
                className="px-4 py-2 bg-[#252d3d] hover:bg-[#2d3748] text-[#e4e6eb] rounded-lg transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Log
              </button>
              <button
                onClick={handleGenerateShareLink}
                className="px-4 py-2 bg-[#252d3d] hover:bg-[#2d3748] text-[#e4e6eb] rounded-lg transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
              <button
                onClick={handleReRun}
                className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Re-run
              </button>
            </div>
          </div>
        </div>

        {/* Execution Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-lg p-4">
            <p className="text-xs text-[#9ca3af] uppercase mb-1">Started</p>
            <p className="text-lg font-semibold text-[#e4e6eb]">{execution.startedAt}</p>
          </div>
          <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-lg p-4">
            <p className="text-xs text-[#9ca3af] uppercase mb-1">Finished</p>
            <p className="text-lg font-semibold text-[#e4e6eb]">{execution.finishedAt || 'Running...'}</p>
          </div>
          <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-lg p-4">
            <p className="text-xs text-[#9ca3af] uppercase mb-1">Duration</p>
            <p className="text-lg font-semibold text-[#e4e6eb]">{execution.duration || '--'}</p>
          </div>
          <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-lg p-4">
            <p className="text-xs text-[#9ca3af] uppercase mb-1">Executed By</p>
            <p className="text-lg font-semibold text-[#e4e6eb]">{execution.executedBy}</p>
          </div>
        </div>

        {/* Navigation */}
        {(execution.previousExecutionId || execution.nextExecutionId) && (
          <div className="flex items-center justify-between mb-6 p-4 bg-[#1a1f2e] border border-[#2d3748] rounded-lg">
            <button
              onClick={() => navigateTo(execution.previousExecutionId)}
              disabled={!execution.previousExecutionId}
              className="px-4 py-2 bg-[#252d3d] hover:bg-[#2d3748] disabled:bg-[#1a1f2e] disabled:text-[#6b7280] text-[#e4e6eb] rounded-lg transition disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous Execution
            </button>
            <span className="text-sm text-[#9ca3af]">
              #{executionId}
            </span>
            <button
              onClick={() => navigateTo(execution.nextExecutionId)}
              disabled={!execution.nextExecutionId}
              className="px-4 py-2 bg-[#252d3d] hover:bg-[#2d3748] disabled:bg-[#1a1f2e] disabled:text-[#6b7280] text-[#e4e6eb] rounded-lg transition disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next Execution
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Server Results */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl overflow-hidden mb-6">
          <div className="p-6 border-b border-[#2d3748]">
            <h2 className="text-lg font-semibold text-[#e4e6eb]">Target Servers</h2>
            <p className="text-sm text-[#9ca3af] mt-1">
              {execution.serverResults?.filter(s => s.status === 'SUCCESS').length || 0} of {execution.serverResults?.length || 0} servers succeeded
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {execution.serverResults?.map((server, idx) => (
                <div key={idx} className={`p-4 rounded-lg border-2 ${
                  server.status === 'SUCCESS' ? 'border-[#10b981] bg-[#064e3b]/20' : 'border-[#ef4444] bg-[#7f1d1d]/20'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {server.status === 'SUCCESS' ? (
                        <svg className="w-5 h-5 text-[#10b981]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-[#ef4444]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                      )}
                      <span className="font-semibold text-[#e4e6eb]">{server.serverName}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded font-semibold ${
                      server.serverType === 'MASTER' ? 'bg-[#064e3b] text-[#86efac]' : 'bg-[#252d3d] text-[#9ca3af]'
                    }`}>
                      {server.serverType}
                    </span>
                  </div>
                  <p className="text-sm text-[#9ca3af] font-mono mb-1">{server.ip}</p>
                  <div className="flex items-center gap-4 text-xs text-[#9ca3af] mt-2">
                    <span>Return Code: <span className={server.returnCode === 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}>{server.returnCode}</span></span>
                    <span>Duration: {server.duration || '--'}</span>
                  </div>
                  {server.errorMessage && (
                    <p className="text-xs text-[#ef4444] mt-2 p-2 bg-[#7f1d1d]/20 rounded">{server.errorMessage}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Console Output */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[#2d3748] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#e4e6eb]">Console Output</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTimestamps(!showTimestamps)}
                className={`px-3 py-1.5 text-xs rounded transition ${
                  showTimestamps ? 'bg-[#3b82f6] text-white' : 'bg-[#252d3d] text-[#e4e6eb] hover:bg-[#2d3748]'
                }`}
              >
                Timestamps
              </button>
              <button
                onClick={() => setWrapText(!wrapText)}
                className={`px-3 py-1.5 text-xs rounded transition ${
                  wrapText ? 'bg-[#3b82f6] text-white' : 'bg-[#252d3d] text-[#e4e6eb] hover:bg-[#2d3748]'
                }`}
              >
                Wrap Text
              </button>
            </div>
          </div>
          <div className="p-6 bg-[#0f1419] font-mono text-sm max-h-[600px] overflow-y-auto">
            {execution.serverResults?.map((server, idx) => (
              <div key={idx} className="mb-6 last:mb-0">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#2d3748]">
                  <svg className="w-4 h-4 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                  <span className="text-[#3b82f6] font-semibold">{server.serverName} ({server.ip})</span>
                </div>
                <pre className={`text-[#e4e6eb] ${wrapText ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'}`}>
                  {server.output || 'No output available'}
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && shareToken && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-6 max-w-lg w-full">
              <h3 className="text-xl font-bold text-[#e4e6eb] mb-4">Share Execution</h3>
              <p className="text-sm text-[#9ca3af] mb-4">
                Share this execution result with others using the link below:
              </p>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/script/execution/shared/${shareToken}`}
                  className="flex-1 px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] font-mono text-sm"
                />
                <button
                  onClick={copyShareLink}
                  className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg transition"
                >
                  Copy
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 bg-[#252d3d] hover:bg-[#2d3748] text-[#e4e6eb] rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
