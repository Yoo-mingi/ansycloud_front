"use client";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/comunity";

const categoryIcons = {
  "설문": "🟢",
  "취약점": "📢",
  "정보": "💡",
  "공유": "💖",
};

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [sortByLike, setSortByLike] = useState(false);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setPosts(data));
  }, []);

  const sortedPosts = sortByLike
    ? [...posts].sort((a, b) => b.like - a.like)
    : posts;

  return (
    <div className="min-h-screen bg-[#f5faff] py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">커뮤니티 게시판</h2>
          <a
            href="/community/create"
            className="px-4 py-2 rounded bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition"
          >
            게시글 작성
          </a>
        </div>
        <table className="w-full text-sm border-t border-b border-blue-200">
          <thead>
            <tr className="bg-blue-50">
              <th className="py-2 px-2 border-b">번호</th>
              <th className="py-2 px-2 border-b">카테고리</th>
              <th className="py-2 px-2 border-b text-left">제목</th>
              <th className="py-2 px-2 border-b">글쓴이</th>
              <th className="py-2 px-2 border-b flex items-center justify-center gap-1">
                좋아요
                <button
                  className="ml-1 text-blue-400 hover:text-blue-600"
                  onClick={() => setSortByLike(s => !s)}
                  title="좋아요 순 정렬"
                >
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path d="M10 4l-6 6h12l-6-6z"/></svg>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPosts.map(post => (
              <tr key={post.id} className="border-b hover:bg-blue-50">
                <td className="py-2 px-2 text-center">{post.id}</td>
                <td className="py-2 px-2 text-center">{categoryIcons[post.category] || post.category}</td>
                <td className="py-2 px-2 text-left">
                  <span className="font-semibold text-blue-700 hover:underline cursor-pointer">{post.title}</span>
                </td>
                <td className="py-2 px-2 text-center">{post.author}</td>
                <td className="py-2 px-2 text-center">{post.like}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
