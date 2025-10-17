'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import Link from 'next/link';

const API_URL = 'http://localhost:8080/comunity';
const categories = ['Question', 'Vulnerability', 'Information', 'Share'];

export default function CommunityCreatePage() {
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scriptList, setScriptList] = useState([]);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [selectedScript, setSelectedScript] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:8080/script')
      .then((res) => res.json())
      .then((data) => setScriptList(data || []))
      .catch((err) => console.error('Failed to fetch scripts:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category || !title.trim() || !content.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('title', title);
      formData.append('content', content);
      if (selectedScript) formData.append('scriptId', selectedScript.id);
      if (image) formData.append('image', image);

      const res = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to create post');
      }

      router.push('/community');
    } catch (err) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0f1419] p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#e4e6eb] mb-2">Create Post</h1>
            <p className="text-[#9ca3af]">Share with the community</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-[#7f1d1d] border border-[#ef4444] text-[#fca5a5] rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-8">
            {/* Category */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#e4e6eb] mb-3">
                Category <span className="text-[#ef4444]">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                disabled={loading}
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#e4e6eb] mb-3">
                Title <span className="text-[#ef4444]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title"
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] placeholder-[#6b7280] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                disabled={loading}
                required
              />
            </div>

            {/* Content */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#e4e6eb] mb-3">
                Content <span className="text-[#ef4444]">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, tips, or questions..."
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-[#e4e6eb] placeholder-[#6b7280] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] min-h-[200px]"
                disabled={loading}
                required
              />
            </div>

            {/* Attachments */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#e4e6eb] mb-3">
                Attachments
              </label>
              <div className="flex gap-3 flex-wrap">
                {/* Image Upload */}
                <label className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-[#252d3d] hover:bg-[#2d3748] text-[#e4e6eb] font-semibold rounded-lg transition border border-[#2d3748]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setImage(e.target.files[0])}
                    disabled={loading}
                  />
                  <span>Attach Image</span>
                </label>

                {/* Script Selector */}
                <button
                  type="button"
                  onClick={() => setShowScriptModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#252d3d] hover:bg-[#2d3748] text-[#e4e6eb] font-semibold rounded-lg transition border border-[#2d3748]"
                  disabled={loading}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                  <span>Attach Script</span>
                </button>
              </div>

              {/* Selected Items */}
              {selectedScript && (
                <div className="mt-4 p-3 bg-[#252d3d] border border-[#3b82f6]/30 rounded-lg">
                  <p className="text-sm text-[#9ca3af]">
                    Script: <span className="text-[#3b82f6] font-semibold">{selectedScript.name}</span>
                  </p>
                </div>
              )}

              {image && (
                <div className="mt-2 p-3 bg-[#252d3d] border border-[#3b82f6]/30 rounded-lg">
                  <p className="text-sm text-[#9ca3af]">
                    Image: <span className="text-[#3b82f6] font-semibold">{image.name}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Link
                href="/community"
                className="px-6 py-3 bg-[#252d3d] hover:bg-[#2d3748] text-[#e4e6eb] font-semibold rounded-lg transition border border-[#2d3748]"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !category || !title.trim() || !content.trim()}
                className="px-6 py-3 bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] hover:from-[#1e40af] hover:to-[#0891b2] disabled:from-[#6b7280] disabled:to-[#4b5563] text-white font-semibold rounded-lg transition transform hover:scale-105 disabled:hover:scale-100"
              >
                {loading ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </form>

          {/* Script Modal */}
          {showScriptModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-8 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold text-[#e4e6eb] mb-6">Select Script</h3>

                <ul className="max-h-64 overflow-auto mb-6 space-y-2">
                  {scriptList.length === 0 ? (
                    <li className="text-[#9ca3af] text-center py-4">
                      No scripts available
                    </li>
                  ) : (
                    scriptList.map((script) => (
                      <li key={script.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedScript(script);
                            setShowScriptModal(false);
                          }}
                          className="w-full text-left px-4 py-3 rounded bg-[#252d3d] hover:bg-[#2d3748] text-[#e4e6eb] transition"
                        >
                          {script.name}
                        </button>
                      </li>
                    ))
                  )}
                </ul>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowScriptModal(false)}
                    className="px-6 py-2 bg-[#252d3d] hover:bg-[#2d3748] text-[#e4e6eb] font-semibold rounded-lg transition border border-[#2d3748]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
