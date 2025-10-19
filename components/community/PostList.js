'use client';

import Link from 'next/link';

const categoryIcons = {
  '설문': '🟢',
  '취약점': '📢',
  '정보': '💡',
  '공유': '💖',
};

export default function CommunityPostList({ posts, sortByLike, onSortChange, loading }) {
  if (loading) {
    return (
      <div className="w-full animate-pulse">
        <div className="h-8 bg-[#1a1f2e] rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-[#1a1f2e] rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#e4e6eb]">Community</h1>
          <p className="text-[#9ca3af] mt-2">Share scripts, tips, and collaborate with others</p>
        </div>
        <Link
          href="/community/create"
          className="px-6 py-3 bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] hover:from-[#1e40af] hover:to-[#0891b2] text-white font-semibold rounded-lg transition transform hover:scale-105"
        >
          + New Post
        </Link>
      </div>

      {/* Empty State */}
      {posts.length === 0 ? (
        <div className="bg-[#1a1f2e] border border-dashed border-[#2d3748] rounded-xl p-12 text-center">
          <svg className="w-16 h-16 text-[#6b7280] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 110 4h-2V8zm0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2H5a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2z" />
          </svg>
          <h3 className="text-lg font-semibold text-[#e4e6eb] mb-2">No Posts Yet</h3>
          <p className="text-[#9ca3af] mb-6">Be the first to share with the community</p>
          <Link
            href="/community/create"
            className="inline-block px-6 py-2 bg-[#3b82f6] hover:bg-[#1e40af] text-white font-semibold rounded-lg transition"
          >
            Create Post
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2d3748] bg-[#252d3d]">
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#e4e6eb]">#</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#e4e6eb]">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#e4e6eb]">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#e4e6eb]">Author</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#e4e6eb] flex items-center gap-2">
                  Likes
                  <button
                    onClick={onSortChange}
                    className="text-[#3b82f6] hover:text-[#06b6d4] transition"
                    title="Sort by likes"
                  >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 4l-6 6h12l-6-6z" />
                    </svg>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-[#2d3748] hover:bg-[#252d3d]/50 transition">
                  <td className="px-6 py-4 text-[#9ca3af] text-sm">{post.id}</td>
                  <td className="px-6 py-4 text-center text-lg">{categoryIcons[post.category] || post.category}</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/community/${post.id}`}
                      className="font-semibold text-[#3b82f6] hover:text-[#06b6d4] transition"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-[#9ca3af]">{post.author}</td>
                  <td className="px-6 py-4 text-center text-[#e4e6eb] font-medium">{post.like || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
