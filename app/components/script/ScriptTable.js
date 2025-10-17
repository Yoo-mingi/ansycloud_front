'use client';

import Link from 'next/link';

export default function ScriptTable({ scripts }) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#e4e6eb]">Scripts</h1>
          <p className="text-[#9ca3af] mt-2">Manage and execute automation scripts</p>
        </div>
        <Link
          href="/script/create"
          className="px-6 py-3 bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] hover:from-[#1e40af] hover:to-[#0891b2] text-white font-semibold rounded-lg transition transform hover:scale-105"
        >
          + New Script
        </Link>
      </div>

      {/* Empty State */}
      {scripts.length === 0 ? (
        <div className="bg-[#1a1f2e] border border-dashed border-[#2d3748] rounded-xl p-12 text-center">
          <svg className="w-16 h-16 text-[#6b7280] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-[#e4e6eb] mb-2">No Scripts Yet</h3>
          <p className="text-[#9ca3af] mb-6">Create your first script to get started</p>
          <Link
            href="/script/create"
            className="inline-block px-6 py-2 bg-[#3b82f6] hover:bg-[#1e40af] text-white font-semibold rounded-lg transition"
          >
            Create Script
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scripts.map((script) => (
            <Link key={script.id} href={`/script/${script.id}`}>
              <div className="h-full bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-6 hover:border-[#3b82f6] hover:shadow-lg transition cursor-pointer">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {script.script_result === 'success' ? (
                      <>
                        <div className="w-2 h-2 bg-[#10b981] rounded-full"></div>
                        <span className="text-xs font-semibold text-[#10b981]">Success</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-[#ef4444] rounded-full"></div>
                        <span className="text-xs font-semibold text-[#ef4444]">Failed</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Script Name */}
                <h3 className="text-lg font-semibold text-[#e4e6eb] mb-2 truncate">
                  {script.name}
                </h3>

                {/* Last Run */}
                <p className="text-sm text-[#9ca3af] mb-4">
                  Last run: <span className="text-[#6b7280]">{script.last_run_date || 'Never'}</span>
                </p>

                {/* Arrow */}
                <div className="flex items-center justify-between pt-4 border-t border-[#2d3748]">
                  <span className="text-xs font-medium text-[#3b82f6]">View Details</span>
                  <svg className="w-4 h-4 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
