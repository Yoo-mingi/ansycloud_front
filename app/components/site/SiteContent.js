'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/app/config';
import SiteTable from './SiteTable';

export default function SiteContent() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/site`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch sites');
        return res.json();
      })
      .then((data) => setSites(data.sites || []))
      .catch((err) => {
        console.error('Failed to fetch sites:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-[#e4e6eb] mb-2">Failed to load sites</h3>
        <p className="text-[#9ca3af]">{error}</p>
      </div>
    );
  }

  return <SiteTable sites={sites} loading={loading} />;
}
