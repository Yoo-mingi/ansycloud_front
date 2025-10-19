import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import CommunityContent from '@/components/community/CommunityContent';

export default function CommunityPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0f1419] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#e4e6eb]">Community</h1>
            <Link
              href="/community/create"
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              New Post
            </Link>
          </div>
          <CommunityContent />
        </div>
      </div>
    </ProtectedRoute>
  );
}
