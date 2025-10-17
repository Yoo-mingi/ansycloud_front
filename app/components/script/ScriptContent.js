'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/app/config';
import ScriptTable from '@/app/components/script/ScriptTable';

export default function ScriptContent() {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/script`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch scripts');
        return res.json();
      })
      .then((data) => setScripts(data.scripts || []))
      .catch((err) => {
        console.error('Failed to fetch scripts:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <svg className="w-16 h-16 text-[#ef4444] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-[#e4e6eb] mb-2">Failed to load scripts</h3>
          <p className="text-[#9ca3af]">{error}</p>
        </div>
      </div>
    );
  }

  return <ScriptTable scripts={scripts} loading={loading} />;
}
