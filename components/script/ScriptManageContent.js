'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/app/config';
import { useAuth } from '@/app/providers/AuthProvider';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import jsyaml from 'js-yaml';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function ScriptManageContent() {
  const searchParams = useSearchParams();
  const scriptName = searchParams.get('name');
  const router = useRouter();
  const { accessToken, refresh, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [yamlError, setYamlError] = useState('');
  
  // Script data
  const [originalScriptName, setOriginalScriptName] = useState('');
  const [editedScriptName, setEditedScriptName] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!scriptName) {
      router.push('/script');
      return;
    }
    fetchScriptData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptName]);

  const fetchScriptData = async () => {
    setLoading(true);
    setError(null);

    try {
      let res = await fetch(`${API_BASE_URL}/api/script/manage`, {
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

        res = await fetch(`${API_BASE_URL}/api/script/manage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`
          },
          body: JSON.stringify({ scriptName })
        });
      }

      if (!res.ok) throw new Error('Failed to fetch script data');

      const data = await res.json();
      console.log('[ScriptManage] Received data:', data);

      setOriginalScriptName(data.scriptName || '');
      setEditedScriptName(data.scriptName || '');
      setDescription(data.description || '');
      setTasks(data.tasks || '');
      setUpdatedAt(data.updatedAt || '');
      
      // 초기 YAML 검증
      validateYAML(data.tasks || '');
    } catch (err) {
      console.error('[ScriptManage] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateYAML = (content) => {
    if (!content.trim()) {
      setYamlError('');
      return true;
    }
    try {
      jsyaml.load(content);
      setYamlError('');
      return true;
    } catch (e) {
      setYamlError(`YAML Error: ${e.message}`);
      return false;
    }
  };

  const handleEditorChange = (value) => {
    setTasks(value || '');
    validateYAML(value || '');
  };

  const handleSave = async () => {
    if (!editedScriptName.trim()) {
      setError('Script name is required');
      return;
    }
    if (!tasks.trim()) {
      setError('Tasks are required');
      return;
    }
    if (!validateYAML(tasks)) {
      setError('Please fix YAML syntax errors before saving');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let res = await fetch(`${API_BASE_URL}/api/script/manage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
        body: JSON.stringify({
          originalScriptName: originalScriptName,
          scriptName: editedScriptName,
          description: description,
          tasks: tasks
        })
      });

      if (res.status === 401) {
        const newToken = await refresh();
        if (!newToken) {
          await logout();
          router.push('/login');
          return;
        }

        res = await fetch(`${API_BASE_URL}/api/script/manage`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`
          },
          body: JSON.stringify({
            originalScriptName: originalScriptName,
            scriptName: editedScriptName,
            description: description,
            tasks: tasks
          })
        });
      }

      if (!res.ok) throw new Error('Failed to update script');

      // 성공하면 스크립트 목록으로 이동
      router.push('/script');
    } catch (err) {
      setError(err.message || 'An error occurred');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      let res = await fetch(`${API_BASE_URL}/api/script/manage`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
        body: JSON.stringify({ scriptName: originalScriptName })
      });

      if (res.status === 401) {
        const newToken = await refresh();
        if (!newToken) {
          await logout();
          router.push('/login');
          return;
        }

        res = await fetch(`${API_BASE_URL}/api/script/manage`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`
          },
          body: JSON.stringify({ scriptName: originalScriptName })
        });
      }

      if (!res.ok) throw new Error('Failed to delete script');

      router.push('/script');
    } catch (err) {
      setError(err.message || 'Failed to delete script');
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6] mx-auto mb-4"></div>
          <p className="text-[#9ca3af]">Loading script...</p>
        </div>
      </div>
    );
  }

  if (error && !editedScriptName) {
    return (
      <div className="min-h-screen bg-[#0f1419] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#7f1d1d] border border-[#ef4444] rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold text-[#fca5a5] mb-2">Error</h3>
            <p className="text-[#fca5a5] mb-4">{error}</p>
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
      <div className="max-w-6xl mx-auto">
        {/* Header - Jenkins Style */}
        <div className="mb-6">
          <Link href="/script" className="text-[#3b82f6] hover:text-[#06b6d4] text-sm mb-2 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Scripts
          </Link>
          <div className="flex items-start justify-between mt-2">
            <div>
              <h1 className="text-3xl font-bold text-[#e4e6eb] mb-2">Configure Script</h1>
              <p className="text-[#9ca3af]">Edit and manage your Ansible automation script</p>
              {updatedAt && (
                <p className="text-sm text-[#6b7280] mt-1">
                  Last updated: <span className="font-mono">{updatedAt}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#06b6d4] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#7f1d1d] border border-[#ef4444] text-[#fca5a5] rounded-lg text-sm flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl overflow-hidden">
          {/* Script Name */}
          <div className="p-6 border-b border-[#2d3748]">
            <label className="block text-sm font-semibold text-[#e4e6eb] mb-3">
              Script Name <span className="text-[#ef4444]">*</span>
            </label>
            <input
              type="text"
              value={editedScriptName}
              onChange={(e) => setEditedScriptName(e.target.value)}
              placeholder="e.g., Install Nginx and Configure"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] placeholder-[#6b7280] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
              disabled={saving}
            />
          </div>

          {/* Description (Optional) */}
          <div className="p-6 border-b border-[#2d3748]">
            <label className="block text-sm font-semibold text-[#e4e6eb] mb-3">
              Description <span className="text-xs text-[#6b7280] font-normal">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this script does..."
              rows="3"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] placeholder-[#6b7280] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] resize-none"
              disabled={saving}
            />
          </div>

          {/* Tasks Editor */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-[#e4e6eb]">
                Tasks (YAML) <span className="text-[#ef4444]">*</span>
              </label>
              {yamlError ? (
                <span className="text-xs text-[#ef4444] flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {yamlError}
                </span>
              ) : tasks.trim() ? (
                <span className="text-xs text-[#10b981] flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Valid YAML
                </span>
              ) : null}
            </div>

            <div className="border border-[#2d3748] rounded-lg overflow-hidden">
              <Editor
                height="500px"
                defaultLanguage="yaml"
                value={tasks}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  readOnly: saving,
                  automaticLayout: true,
                  tabSize: 2,
                  insertSpaces: true,
                  wordWrap: 'on'
                }}
              />
            </div>

            <p className="mt-3 text-xs text-[#6b7280]">
              💡 Write Ansible tasks in YAML format. The playbook name and hosts will be set during execution.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-[#252d3d] border-t border-[#2d3748] flex justify-between items-center">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={saving}
              className="px-6 py-2.5 bg-[#7f1d1d] hover:bg-[#991b1b] disabled:bg-[#6b7280] text-[#fca5a5] font-semibold rounded-lg transition disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Script
            </button>

            <div className="flex gap-3">
              <Link 
                href="/script" 
                className="px-6 py-2.5 bg-[#1a1f2e] hover:bg-[#0f1419] text-[#e4e6eb] font-medium rounded-lg transition border border-[#2d3748]"
              >
                Cancel
              </Link>
              <button
                onClick={handleSave}
                disabled={saving || !editedScriptName.trim() || !tasks.trim() || !!yamlError}
                className="px-6 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#6b7280] text-white font-semibold rounded-lg transition disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
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
                    Are you sure you want to delete <span className="font-semibold text-[#e4e6eb]">&ldquo;{originalScriptName}&rdquo;</span>? 
                    This action cannot be undone.
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
    </div>
  );
}
