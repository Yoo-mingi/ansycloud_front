"use client";
import { useState } from "react";
import { API_BASE_URL } from "../../config";
import { useRouter } from "next/navigation";

export default function ScriptCreatePage() {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setLoading(true);
    await fetch(`${API_BASE_URL}/script`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, content }),
    });
    setLoading(false);
    router.push("/script");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#eaf6ff] via-[#f5faff] to-[#e3eafc]">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-6">스크립트 생성</h2>
        <label className="block mb-2 font-semibold">스크립트 이름</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-6"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="예: 배포 스크립트"
        />
        <label className="block mb-2 font-semibold">스크립트 내용 (YAML)</label>
        <textarea
          className="w-full border border-gray-300 rounded px-3 py-2 mb-6 font-mono min-h-[200px] bg-[#f5faff]"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="여기에 ansible yaml 스크립트를 입력하세요"
        />
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded bg-gray-200" onClick={() => router.push('/script')} disabled={loading}>취소</button>
          <button
            className="px-4 py-2 rounded bg-blue-500 text-white font-semibold"
            onClick={handleSave}
            disabled={!name || !content || loading}
          >
            {loading ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
