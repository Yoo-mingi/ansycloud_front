'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/app/config';
import { useAuth } from '@/app/providers/AuthProvider';
import dynamic from 'next/dynamic';
import jsyaml from 'js-yaml';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function ScriptEditModal({ scriptName, isOpen, onClose, onSaved }) {
  const { accessToken, refresh, logout } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [yamlError, setYamlError] = useState('');
  const [activeTab, setActiveTab] = useState('edit'); // edit, schedule, versions
  
  // Form data
  const [formData, setFormData] = useState({
    scriptName: '',
    description: '',
    tasks: '',
    tags: []
  });
  
  const [schedule, setSchedule] = useState({
    enabled: false,
    cronExpression: '0 0 * * *',
    readableFormat: 'Every day at midnight'
  });
  
  const [versions, setVersions] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showDryRun, setShowDryRun] = useState(false);

  useEffect(() => {
    if (isOpen && scriptName) {
      fetchScriptData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, scriptName]);

  const fetchScriptData = async () => {
    setLoading(true);
    try {
      let res = await fetch(`${API_BASE_URL}/api/script/edit?name=${encodeURIComponent(scriptName)}`, {
        headers: {
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        }
      });

      if (res.status === 401) {
        const newToken = await refresh();
        if (!newToken) {
          await logout();
          return;
        }
        res = await fetch(`${API_BASE_URL}/api/script/edit?name=${encodeURIComponent(scriptName)}`, {
          headers: { 'Authorization': `Bearer ${newToken}` }
        });
      }

      if (!res.ok) throw new Error('Failed to fetch script data');

      const data = await res.json();
      setFormData({
        scriptName: data.scriptName || '',
        description: data.description || '',
        tasks: data.tasks || '',
        tags: data.tags || []
      });
      setSchedule(data.schedule || { enabled: false, cronExpression: '0 0 * * *' });
      setVersions(data.versions || []);
      validateYAML(data.tasks || '');
    } catch (err) {
      console.error('[ScriptEdit] Error:', err);
      alert(err.message);
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
    setFormData(prev => ({ ...prev, tasks: value || '' }));
    validateYAML(value || '');
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSave = async () => {
    if (!formData.scriptName.trim()) {
      alert('Script name is required');
      return;
    }
    if (!formData.tasks.trim()) {
      alert('Tasks are required');
      return;
    }
    if (!validateYAML(formData.tasks)) {
      alert('Please fix YAML syntax errors before saving');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/script/script`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
        body: JSON.stringify({
          originalScriptName: scriptName,
          scriptName: formData.scriptName,
          description: formData.description,
          tasks: formData.tasks,
          tags: formData.tags,
          schedule: schedule
        })
      });

      if (!res.ok) throw new Error('Failed to update script');

      onSaved();
      onClose();
    } catch (err) {
      alert(err.message);
      setSaving(false);
    }
  };

  const handleDuplicate = async () => {
    const newName = prompt('Enter name for duplicated script:', `${formData.scriptName} (Copy)`);
    if (!newName || newName.trim() === '') return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/script/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
        body: JSON.stringify({
          originalScriptName: scriptName,
          newScriptName: newName.trim()
        })
      });

      if (!res.ok) throw new Error('Failed to duplicate script');

      alert('Script duplicated successfully');
      onSaved();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDryRun = async () => {
    setShowDryRun(true);
    // Dry run 로직은 별도 모달이나 API 호출로 구현
    alert('Dry run feature - This will show what changes would be made without applying them');
  };

  const handleRestoreVersion = async (version) => {
    if (!confirm(`Restore to version ${version.version}?`)) return;

    setFormData(prev => ({
      ...prev,
      scriptName: version.scriptName,
      description: version.description,
      tasks: version.content,
      tags: version.tags || []
    }));
    validateYAML(version.content);
    setActiveTab('edit');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl w-full max-w-6xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2d3748]">
          <div>
            <h2 className="text-2xl font-bold text-[#e4e6eb]">Edit Script</h2>
            <p className="text-sm text-[#9ca3af] mt-1">Modify script configuration and content</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#9ca3af] hover:text-[#e4e6eb] transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6] mx-auto mb-4"></div>
            <p className="text-[#9ca3af]">Loading script data...</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-[#2d3748] px-6">
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-4 py-3 font-medium transition border-b-2 ${
                  activeTab === 'edit'
                    ? 'border-[#3b82f6] text-[#3b82f6]'
                    : 'border-transparent text-[#9ca3af] hover:text-[#e4e6eb]'
                }`}
              >
                Edit Script
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-4 py-3 font-medium transition border-b-2 ${
                  activeTab === 'schedule'
                    ? 'border-[#3b82f6] text-[#3b82f6]'
                    : 'border-transparent text-[#9ca3af] hover:text-[#e4e6eb]'
                }`}
              >
                Schedule
              </button>
              <button
                onClick={() => setActiveTab('versions')}
                className={`px-4 py-3 font-medium transition border-b-2 ${
                  activeTab === 'versions'
                    ? 'border-[#3b82f6] text-[#3b82f6]'
                    : 'border-transparent text-[#9ca3af] hover:text-[#e4e6eb]'
                }`}
              >
                Version History
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
              {/* Edit Tab */}
              {activeTab === 'edit' && (
                <div className="space-y-6">
                  {/* Script Name */}
                  <div>
                    <label className="block text-sm font-semibold text-[#e4e6eb] mb-2">
                      Script Name <span className="text-[#ef4444]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.scriptName}
                      onChange={(e) => setFormData(prev => ({ ...prev, scriptName: e.target.value }))}
                      className="w-full px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] placeholder-[#6b7280] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                      disabled={saving}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-[#e4e6eb] mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows="3"
                      className="w-full px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] placeholder-[#6b7280] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] resize-none"
                      placeholder="Describe what this script does..."
                      disabled={saving}
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-semibold text-[#e4e6eb] mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        placeholder="Add tag..."
                        className="flex-1 px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] placeholder-[#6b7280] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                        disabled={saving}
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg transition"
                        disabled={saving}
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-[#252d3d] text-[#e4e6eb] text-sm rounded-full"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-[#ef4444] transition"
                            disabled={saving}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* YAML Editor */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-[#e4e6eb]">
                        Tasks (YAML) <span className="text-[#ef4444]">*</span>
                      </label>
                      {yamlError ? (
                        <span className="text-xs text-[#ef4444]">{yamlError}</span>
                      ) : formData.tasks.trim() ? (
                        <span className="text-xs text-[#10b981]">✓ Valid YAML</span>
                      ) : null}
                    </div>
                    <div className="border border-[#2d3748] rounded-lg overflow-hidden">
                      <Editor
                        height="400px"
                        defaultLanguage="yaml"
                        value={formData.tasks}
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
                  </div>
                </div>
              )}

              {/* Schedule Tab */}
              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="schedule-enabled"
                      checked={schedule.enabled}
                      onChange={(e) => setSchedule(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="w-5 h-5 text-[#3b82f6] bg-[#0f1419] border-[#2d3748] rounded focus:ring-[#3b82f6]"
                    />
                    <label htmlFor="schedule-enabled" className="text-[#e4e6eb] font-semibold">
                      Enable automatic execution
                    </label>
                  </div>

                  {schedule.enabled && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-[#e4e6eb] mb-2">
                          Cron Expression
                        </label>
                        <input
                          type="text"
                          value={schedule.cronExpression}
                          onChange={(e) => setSchedule(prev => ({ ...prev, cronExpression: e.target.value }))}
                          placeholder="0 0 * * *"
                          className="w-full px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] placeholder-[#6b7280] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] font-mono"
                        />
                        <p className="text-xs text-[#6b7280] mt-2">
                          Format: minute hour day month weekday (e.g., &ldquo;0 0 * * *&rdquo; = daily at midnight)
                        </p>
                      </div>

                      <div className="p-4 bg-[#0f1419] border border-[#2d3748] rounded-lg">
                        <p className="text-sm text-[#9ca3af]">
                          <span className="font-semibold text-[#e4e6eb]">Schedule:</span> {schedule.readableFormat || 'Custom'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setSchedule(prev => ({ ...prev, cronExpression: '0 0 * * *', readableFormat: 'Every day at midnight' }))}
                          className="px-4 py-2 bg-[#252d3d] hover:bg-[#2d3748] text-[#e4e6eb] text-sm rounded-lg transition"
                        >
                          Daily
                        </button>
                        <button
                          onClick={() => setSchedule(prev => ({ ...prev, cronExpression: '0 0 * * 0', readableFormat: 'Every Sunday at midnight' }))}
                          className="px-4 py-2 bg-[#252d3d] hover:bg-[#2d3748] text-[#e4e6eb] text-sm rounded-lg transition"
                        >
                          Weekly
                        </button>
                        <button
                          onClick={() => setSchedule(prev => ({ ...prev, cronExpression: '0 0 1 * *', readableFormat: 'First day of every month' }))}
                          className="px-4 py-2 bg-[#252d3d] hover:bg-[#2d3748] text-[#e4e6eb] text-sm rounded-lg transition"
                        >
                          Monthly
                        </button>
                        <button
                          onClick={() => setSchedule(prev => ({ ...prev, cronExpression: '0 * * * *', readableFormat: 'Every hour' }))}
                          className="px-4 py-2 bg-[#252d3d] hover:bg-[#2d3748] text-[#e4e6eb] text-sm rounded-lg transition"
                        >
                          Hourly
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Version History Tab */}
              {activeTab === 'versions' && (
                <div>
                  {versions.length === 0 ? (
                    <div className="text-center py-12 text-[#6b7280]">
                      <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>No version history available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {versions.map((version) => (
                        <div
                          key={version.version}
                          className="p-4 bg-[#0f1419] border border-[#2d3748] rounded-lg hover:border-[#3b82f6]/50 transition"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-1 bg-[#3b82f6] text-white text-xs font-bold rounded">
                                  v{version.version}
                                </span>
                                <span className="text-sm font-semibold text-[#e4e6eb]">{version.scriptName}</span>
                              </div>
                              <p className="text-xs text-[#9ca3af]">
                                Modified by {version.modifiedBy} • {version.createdAt}
                              </p>
                              {version.changeDescription && (
                                <p className="text-sm text-[#9ca3af] mt-2">{version.changeDescription}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleRestoreVersion(version)}
                              className="px-3 py-1.5 bg-[#252d3d] hover:bg-[#3b82f6] text-[#e4e6eb] text-xs rounded transition"
                            >
                              Restore
                            </button>
                          </div>
                          {version.tags && version.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {version.tags.map((tag) => (
                                <span key={tag} className="px-2 py-0.5 bg-[#252d3d] text-[#9ca3af] text-xs rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-[#2d3748] bg-[#252d3d]">
              <div className="flex gap-2">
                <button
                  onClick={handleDuplicate}
                  disabled={saving}
                  className="px-4 py-2 bg-[#1a1f2e] hover:bg-[#0f1419] text-[#e4e6eb] rounded-lg transition border border-[#2d3748] disabled:opacity-50"
                >
                  Duplicate
                </button>
                <button
                  onClick={handleDryRun}
                  disabled={saving}
                  className="px-4 py-2 bg-[#1a1f2e] hover:bg-[#0f1419] text-[#e4e6eb] rounded-lg transition border border-[#2d3748] disabled:opacity-50"
                >
                  Dry Run
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="px-6 py-2 bg-[#1a1f2e] hover:bg-[#0f1419] text-[#e4e6eb] rounded-lg transition border border-[#2d3748]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.scriptName.trim() || !formData.tasks.trim() || !!yamlError}
                  className="px-6 py-2 bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#6b7280] text-white font-semibold rounded-lg transition disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
