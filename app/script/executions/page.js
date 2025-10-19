import ProtectedRoute from '@/components/ProtectedRoute';
import ExecutionHistoryContent from '@/components/script/ExecutionHistoryContent';

export default function ExecutionHistoryPage() {
  return (
    <ProtectedRoute>
      <ExecutionHistoryContent />
    </ProtectedRoute>
  );
}
