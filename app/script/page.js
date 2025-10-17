import ProtectedRoute from '@/app/components/ProtectedRoute';
import ScriptContent from '@/app/components/script/ScriptContent';

export default function ScriptPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0f1419] p-8">
        <div className="max-w-7xl mx-auto">
          <ScriptContent />
        </div>
      </div>
    </ProtectedRoute>
  );
}
