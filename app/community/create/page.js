"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const API_URL = "http://localhost:8080/comunity";
const categories = ["질문", "취약점", "정보", "공유"];

export default function CommunityCreatePage() {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scriptList, setScriptList] = useState([]);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [selectedScript, setSelectedScript] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:8080/script")
      .then(res => res.json())
      .then(data => setScriptList(data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("category", category);
    formData.append("title", title);
    formData.append("content", content);
    if (selectedScript) formData.append("scriptId", selectedScript.id);
    if (image) formData.append("image", image);
    await fetch(API_URL, {
      method: "POST",
      body: formData,
    });
    setLoading(false);
    router.push("/community");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#eaf6ff] via-[#f5faff] to-[#e3eafc]">
      <form className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6">게시글 작성</h2>
        <label className="block mb-2 font-semibold">카테고리</label>
        <select
          className="w-full border border-gray-300 rounded px-3 py-2 mb-6"
          value={category}
          onChange={e => setCategory(e.target.value)}
          required
        >
          <option value="">카테고리를 선택하세요</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <label className="block mb-2 font-semibold">제목</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-6"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          required
        />
        <label className="block mb-2 font-semibold">내용</label>
        <textarea
          className="w-full border border-gray-300 rounded px-3 py-2 mb-2 min-h-[120px]"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
          required
        />
        {/* 첨부 버튼 영역 */}
        <div className="flex gap-2 mb-4">
          <label className="flex items-center gap-1 cursor-pointer text-sm px-2 py-1 bg-blue-50 rounded hover:bg-blue-100 border border-blue-200">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => setImage(e.target.files[0])}
            />
            <span>그림 첨부</span>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5zm2 2a1 1 0 100 2 1 1 0 000-2zm0 2.5A2.5 2.5 0 018.5 10a2.5 2.5 0 01-2.5 2.5A2.5 2.5 0 013.5 10a2.5 2.5 0 012.5-2.5z"/></svg>
          </label>
          <button
            type="button"
            className="flex items-center gap-1 text-sm px-2 py-1 bg-blue-50 rounded hover:bg-blue-100 border border-blue-200"
            onClick={() => setShowScriptModal(true)}
          >
            스크립트 첨부
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm0 2h10a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z"/></svg>
          </button>
        </div>
        {/* 선택된 스크립트 표시 */}
        {selectedScript && (
          <div className="mb-4 text-sm text-blue-700">공유할 스크립트 명: <span className="font-semibold">{selectedScript.name}</span></div>
        )}
        {/* 선택된 이미지 표시 */}
        {image && (
          <div className="mb-4 text-sm text-gray-700">첨부된 그림: <span className="font-semibold">{image.name}</span></div>
        )}
        {/* 스크립트 선택 모달 */}
        {showScriptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">스크립트 선택</h3>
              <ul className="max-h-60 overflow-auto mb-4">
                {scriptList.length === 0 ? (
                  <li className="text-gray-400">스크립트가 없습니다.</li>
                ) : (
                  scriptList.map(script => (
                    <li key={script.id}>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 rounded hover:bg-blue-100"
                        onClick={() => { setSelectedScript(script); setShowScriptModal(false); }}
                      >
                        {script.name}
                      </button>
                    </li>
                  ))
                )}
              </ul>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200"
                  onClick={() => setShowScriptModal(false)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <button className="px-4 py-2 rounded bg-gray-200" type="button" onClick={() => router.push('/community')} disabled={loading}>취소</button>
          <button
            className="px-4 py-2 rounded bg-blue-500 text-white font-semibold"
            type="submit"
            disabled={loading || !category || !title || !content}
          >
            {loading ? "작성 중..." : "작성"}
          </button>
        </div>
      </form>
    </div>
  );
}
