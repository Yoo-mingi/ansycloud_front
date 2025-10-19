'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ScriptTable({ scripts, loading }) {
  const [searchQuery, setSearchQuery] = useState('');

  // 검색 필터링
  const filteredScripts = scripts.filter((script) =>
    script.scriptName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Header - Jenkins Style */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#3b82f6] to-[#06b6d4] rounded-lg flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#e4e6eb]">All Scripts</h1>
              <p className="text-sm text-[#9ca3af]">{scripts.length} script{scripts.length !== 1 ? 's' : ''} available</p>
            </div>
          </div>
          <Link
            href="/script/create"
            className="px-5 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-semibold rounded-lg transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Item
          </Link>
        </div>

        {/* Search Bar - Jenkins Style */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search scripts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 bg-[#1a1f2e] border border-[#2d3748] rounded-lg text-[#e4e6eb] placeholder-[#6b7280] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] text-sm"
          />
          <svg className="absolute left-3 top-3 w-5 h-5 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6]"></div>
        </div>
      ) : filteredScripts.length === 0 ? (
        /* Empty State - Jenkins Style */
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-lg p-12 text-center">
          <svg className="w-20 h-20 text-[#6b7280] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-[#e4e6eb] mb-2">
            {searchQuery ? 'No scripts found' : 'No Scripts'}
          </h3>
          <p className="text-[#9ca3af] mb-6">
            {searchQuery 
              ? `No scripts match "${searchQuery}"`
              : 'Create your first automation script to get started'
            }
          </p>
          {!searchQuery && (
            <Link
              href="/script/create"
              className="inline-block px-6 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold rounded-lg transition"
            >
              Create New Script
            </Link>
          )}
        </div>
      ) : (
        /* Script List - Jenkins Style (List View) */
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#252d3d] border-b border-[#2d3748]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">Updated At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d3748]">
              {filteredScripts.map((script, index) => (
                <tr key={script.scriptName || index} className="hover:bg-[#252d3d]/50 transition">
                  <td className="px-6 py-4">
                    <Link href={`/script/manage?name=${encodeURIComponent(script.scriptName)}`} className="flex items-center gap-2 hover:text-[#3b82f6] transition group">
                      <svg className="w-5 h-5 text-[#6b7280] group-hover:text-[#3b82f6] transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-medium text-[#e4e6eb] group-hover:text-[#3b82f6] transition">{script.scriptName}</span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#9ca3af]">
                    {script.description || <span className="text-[#6b7280] italic">No description</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#9ca3af]">
                    {script.createdAt ? new Date(script.createdAt).toLocaleString('ko-KR') : <span className="text-[#6b7280]">N/A</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#9ca3af]">
                    {script.updatedAt ? new Date(script.updatedAt).toLocaleString('ko-KR') : <span className="text-[#6b7280]">N/A</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
