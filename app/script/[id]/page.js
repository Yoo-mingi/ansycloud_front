"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../config";

export default function ScriptDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [script, setScript] = useState(null);
  const [sites, setSites] = useState([]);
  const [servers, setServers] = useState([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [selectedServer, setSelectedServer] = useState("");
  const [history, setHistory] = useState([]);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/script/${id}`)
      .then(res => res.json())
      .then(data => setScript(data));
    fetch(`${API_BASE_URL}/site`)
      .then(res => res.json())
      .then(data => setSites(data));
    fetch(`${API_BASE_URL}/script/${id}/history`)
      .then(res => res.json())
      .then(data => setHistory(data));
  }, [id]);

  useEffect(() => {
    if (selectedSite) {
      fetch(`${API_BASE_URL}/site/${selectedSite}/servers`)
        .then(res => res.json())
        .then(data => setServers(data));
    } else {
      setServers([]);
      setSelectedServer("");
    }
  }, [selectedSite]);

  const handleRun = async () => {
    if (!selectedSite || !selectedServer) return;
    setLoading(true);
    const res = await fetch(`${API_BASE_URL}/script/${id}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId: selectedSite, serverId: selectedServer }),
    });
    const result = await res.json();
    setOutput(result.output || "");
    setLoading(false);
    // Refresh history
    fetch(`${API_BASE_URL}/script/${id}/history`)
      .then(res => res.json())
      .then(data => setHistory(data));
  };

  const handleSelectHistory = async (historyId) => {
    const res = await fetch(`${API_BASE_URL}/script/${id}/history/${historyId}`);
    const result = await res.json();
    setOutput(result.output || "");
  };

  const handleDelete = async () => {
    if (confirm("정말 삭제하시겠습니까?")) {
      await fetch(`${API_BASE_URL}/script/${id}`, { method: "DELETE" });
      router.push("/script");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f5faff]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-blue-100 p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-6">{script?.name || "스크립트"}</h2>
        <nav className="flex flex-col gap-3 mb-8">
          <button className="text-left px-2 py-1 rounded hover:bg-blue-50 font-semibold">코드 변경</button>
          <button className="text-left px-2 py-1 rounded hover:bg-blue-50 font-semibold text-red-500" onClick={handleDelete}>삭제</button>
          <Link href="/community" className="text-left px-2 py-1 rounded hover:bg-blue-50 font-semibold text-blue-500">공유</Link>
        </nav>
        <div className="mt-4">
          <h3 className="font-bold mb-2">최근 실행 이력</h3>
          <ul className="space-y-1">
            {history.map((h, idx) => (
              <li key={h.id}>
                <button
                  className="text-left w-full px-2 py-1 rounded hover:bg-blue-50 text-gray-700"
                  onClick={() => handleSelectHistory(h.id)}
                >
                  #{history.length - idx}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-10">
        <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8">
          <h3 className="text-lg font-bold mb-4">서버 선택</h3>
          <div className="mb-4">
            <label className="block mb-2 font-semibold">사이트 선택</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={selectedSite}
              onChange={e => setSelectedSite(e.target.value)}
            >
              <option value="">사이트를 선택하세요</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </div>
          {selectedSite && (
            <div className="mb-6">
              <label className="block mb-2 font-semibold">서버 선택</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={selectedServer}
                onChange={e => setSelectedServer(e.target.value)}
              >
                <option value="">서버를 선택하세요</option>
                {servers.map(server => (
                  <option key={server.id} value={server.id}>{server.name}</option>
                ))}
              </select>
            </div>
          )}
          <button
            className="w-full px-4 py-2 rounded bg-blue-500 text-white font-semibold mb-4"
            onClick={handleRun}
            disabled={!selectedSite || !selectedServer || loading}
          >
            {loading ? "실행 중..." : "실행"}
          </button>
          {output && (
            <div className="mt-6">
              <h4 className="font-bold mb-2">Output</h4>
              <pre className="bg-gray-100 rounded p-4 text-sm whitespace-pre-wrap max-h-64 overflow-auto">{output}</pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
