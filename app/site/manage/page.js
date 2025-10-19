import ProtectedRoute from '@/components/ProtectedRoute';
import SiteManageContent from '@/components/site/SiteManageContent';

export default function SiteManagePage() {
  return (
    <ProtectedRoute>
      <SiteManageContent />
    </ProtectedRoute>
  );
}
