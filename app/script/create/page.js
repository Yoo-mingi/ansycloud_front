'use client';

import { useState, useRef } from 'react';
import { API_BASE_URL } from '../../config';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { fetchWithAuth } from '@/app/utils/fetchWithAuth';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import jsyaml from 'js-yaml';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const EXAMPLE_TEMPLATES = {
  nginx: {
    name: 'Install and Start Nginx',
    tasks: `- name: Install nginx
  ansible.builtin.apt:
    name: nginx
    state: present
    update_cache: yes

- name: Start nginx service
  ansible.builtin.service:
    name: nginx
    state: started
    enabled: yes`
  },
  docker: {
    name: 'Install Docker',
    tasks: `- name: Install required packages
  ansible.builtin.apt:
    name:
      - apt-transport-https
      - ca-certificates
      - curl
      - software-properties-common
    state: present
    update_cache: yes

- name: Add Docker GPG key
  ansible.builtin.apt_key:
    url: https://download.docker.com/linux/ubuntu/gpg
    state: present

- name: Add Docker repository
  ansible.builtin.apt_repository:
    repo: deb https://download.docker.com/linux/ubuntu focal stable
    state: present

- name: Install Docker
  ansible.builtin.apt:
    name: docker-ce
    state: present
    update_cache: yes`
  },
  fileManagement: {
    name: 'Copy and Configure Files',
    tasks: `- name: Copy configuration file
  ansible.builtin.copy:
    src: /local/path/config.conf
    dest: /etc/app/config.conf
    owner: root
    group: root
    mode: '0644'
    backup: yes

- name: Create directory
  ansible.builtin.file:
    path: /var/app/data
    state: directory
    owner: appuser
    group: appuser
    mode: '0755'`
  }
};

export default function ScriptCreatePage() {
  const [scriptName, setScriptName] = useState('');
  const [tasks, setTasks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [yamlError, setYamlError] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const router = useRouter();
  const editorRef = useRef(null);

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

  const applyTemplate = (templateKey) => {
    const template = EXAMPLE_TEMPLATES[templateKey];
    setScriptName(template.name);
    setTasks(template.tasks);
    validateYAML(template.tasks);
    setShowExamples(false);
  };

  const handleCreate = async () => {
    if (!scriptName.trim()) {
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

    setLoading(true);
    setError('');

    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/script/script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          scriptName: scriptName,  // 백엔드 DTO 필드명과 일치
          tasks: tasks             // 백엔드 DTO 필드명과 일치
        }),
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#e4e6eb] mb-2">Create Ansible Script</h1>
                <p className="text-[#9ca3af]">Write your automation tasks in YAML format</p>
              </div>
              <button
                onClick={() => setShowExamples(!showExamples)}
                className="px-4 py-2 bg-[#252d3d] hover:bg-[#2d3748] text-[#e4e6eb] text-sm font-medium rounded-lg transition border border-[#2d3748] flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Example Templates
              </button>
            </div>
          </div>

          {showExamples && (
            <div className="mb-6 bg-[#1a1f2e] border border-[#2d3748] rounded-lg p-4">
              <h3 className="text-sm font-semibold text-[#e4e6eb] mb-3">Choose a template:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(EXAMPLE_TEMPLATES).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => applyTemplate(key)}
                    className="px-3 py-2 bg-[#252d3d] hover:bg-[#3b82f6] text-[#9ca3af] hover:text-white text-sm rounded-lg transition text-left"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-[#7f1d1d] border border-[#ef4444] text-[#fca5a5] rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl overflow-hidden">
            <div className="p-6 border-b border-[#2d3748]">
              <label className="block text-sm font-semibold text-[#e4e6eb] mb-3">
                Script Name <span className="text-[#ef4444]">*</span>
              </label>
              <input
                type="text"
                value={scriptName}
                onChange={(e) => setScriptName(e.target.value)}
                placeholder="e.g., Install Nginx and Configure"
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] placeholder-[#6b7280] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                disabled={loading}
              />
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-[#e4e6eb]">
                  Tasks (YAML) <span className="text-[#ef4444]">*</span>
                </label>
                {yamlError ? (
                  <span className="text-xs text-[#ef4444]">{yamlError}</span>
                ) : tasks.trim() ? (
                  <span className="text-xs text-[#10b981]">✓ Valid YAML</span>
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
                    readOnly: loading,
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

            <div className="px-6 py-4 bg-[#252d3d] border-t border-[#2d3748] flex justify-end gap-3">
              <Link href="/script" className="px-6 py-2.5 bg-[#1a1f2e] hover:bg-[#0f1419] text-[#e4e6eb] font-medium rounded-lg transition border border-[#2d3748]">
                Cancel
              </Link>
              <button
                onClick={handleCreate}
                disabled={loading || !scriptName.trim() || !tasks.trim() || !!yamlError}
                className="px-6 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#6b7280] text-white font-semibold rounded-lg transition disabled:cursor-not-allowed"
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