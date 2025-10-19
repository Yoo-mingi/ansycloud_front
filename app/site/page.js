import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import SiteContent from '@/components/site/SiteContent';

export default function SitePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0f1419] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#e4e6eb]">Site Management</h1>
            <Link
              href="/site/create"
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Add New Site
            </Link>
          </div>
          <SiteContent />
        </div>
      </div>
    </ProtectedRoute>
  );
}
