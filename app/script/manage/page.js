import ProtectedRoute from '@/components/ProtectedRoute';
import ScriptDashboardContent from '@/components/script/ScriptDashboardContent';

export default function ScriptManagePage() {
  return (
    <ProtectedRoute>
      <ScriptDashboardContent />
    </ProtectedRoute>
  );
}
