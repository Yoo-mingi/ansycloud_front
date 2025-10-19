import ProtectedRoute from '@/components/ProtectedRoute';
import ExecutionDetailContent from '@/components/script/ExecutionDetailContent';

export default function ExecutionDetailPage() {
  return (
    <ProtectedRoute>
      <ExecutionDetailContent />
    </ProtectedRoute>
  );
}
