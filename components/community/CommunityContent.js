'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/app/config';
import { fetchWithAuth } from '@/app/utils/fetchWithAuth';
import PostList from './PostList';

export default function CommunityContent() {
  const [posts, setPosts] = useState([]);
  const [sortByLike, setSortByLike] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchWithAuth(`${API_BASE_URL}/api/community/community`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch posts');
        return res.json();
      })
      .then((data) => setPosts(data.posts || []))
      .catch((err) => {
        console.error('Failed to fetch posts:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-[#e4e6eb] mb-2">Failed to load posts</h3>
        <p className="text-[#9ca3af]">{error}</p>
      </div>
    );
  }

  return (
    <PostList 
      posts={posts} 
      sortByLike={sortByLike} 
      onSortChange={setSortByLike}
      loading={loading}
    />
  );
}
