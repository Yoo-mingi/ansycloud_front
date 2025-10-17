'use client';

import Link from 'next/link';

export default function SiteTable({ sites, loading }) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#e4e6eb]">Infrastructure Sites</h1>
          <p className="text-[#9ca3af] mt-2">Manage and configure your infrastructure sites</p>
        </div>
        <Link
          href="/site/create"
          className="px-6 py-3 bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] hover:from-[#1e40af] hover:to-[#0891b2] text-white font-semibold rounded-lg transition transform hover:scale-105"
        >
          + New Site
        </Link>
      </div>

      {/* Empty State */}
      {sites.length === 0 && !loading ? (
        <div className="bg-[#1a1f2e] border border-dashed border-[#2d3748] rounded-xl p-12 text-center">
          <svg className="w-16 h-16 text-[#6b7280] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v5a2 2 0 01-2 2M5 12a2 2 0 001 1.732l7 4a2 2 0 002-2V7a2 2 0 00-2 2" />
          </svg>
          <h3 className="text-lg font-semibold text-[#e4e6eb] mb-2">No Sites Yet</h3>
          <p className="text-[#9ca3af] mb-6">Create your first infrastructure site to get started</p>
          <Link
            href="/site/create"
            className="inline-block px-6 py-2 bg-[#3b82f6] hover:bg-[#1e40af] text-white font-semibold rounded-lg transition"
          >
            Create Site
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2d3748] bg-[#252d3d]">
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#e4e6eb]">Site Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#e4e6eb]">Master Node</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#e4e6eb]">Slave Nodes</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#e4e6eb]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#e4e6eb]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => (
                <tr key={site.id} className="border-b border-[#2d3748] hover:bg-[#252d3d]/50 transition">
                  <td className="px-6 py-4 text-[#e4e6eb] font-medium">{site.name || '-'}</td>
                  <td className="px-6 py-4 text-[#9ca3af]">{site.masterNode || '-'}</td>
                  <td className="px-6 py-4 text-[#9ca3af]">{site.slaveNode || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      site.status === 'active' || site.status === 'online'
                        ? 'bg-[#064e3b] text-[#86efac]'
                        : 'bg-[#7f1d1d] text-[#fca5a5]'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        site.status === 'active' || site.status === 'online' ? 'bg-[#10b981]' : 'bg-[#ef4444]'
                      }`}></div>
                      {site.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/site/${site.id}`}
                      className="text-[#3b82f6] hover:text-[#06b6d4] font-semibold text-sm transition"
                    >
                      Edit
                    </Link>
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
