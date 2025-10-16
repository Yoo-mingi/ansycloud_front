    "use client";
    import { useEffect, useState } from "react";
    import { API_BASE_URL } from "../config";

    function SiteTable({ sites }) {
      return (
        <div className="w-full max-w-5xl mx-auto mt-12">
          <div className="flex justify-end mb-2">
            <a href="/site/create" className="bg-[#eaf6ff] hover:bg-[#cce6ff] text-gray-800 font-semibold py-2 px-6 rounded shadow">생성</a>
          </div>
          <table className="w-full border border-[#e0e4ea] bg-[#f5faff] rounded-lg overflow-hidden">
            <thead className="bg-[#eaf6ff]">
              <tr>
                <th className="border border-[#e0e4ea] px-4 py-2 font-semibold">사이트 명</th>
                <th className="border border-[#e0e4ea] px-4 py-2 font-semibold">마스터 노드</th>
                <th className="border border-[#e0e4ea] px-4 py-2 font-semibold">슬레이브 노드</th>
                <th className="border border-[#e0e4ea] px-4 py-2 font-semibold">연결 상태</th>
                <th className="border border-[#e0e4ea] px-4 py-2 font-semibold">수정</th>
              </tr>
            </thead>
            <tbody>
              {sites.length === 0 ? (
                <tr className="bg-white">
                  <td className="border border-[#e0e4ea] px-4 py-6" />
                  <td className="border border-[#e0e4ea] px-4 py-6" />
                  <td className="border border-[#e0e4ea] px-4 py-6" />
                  <td className="border border-[#e0e4ea] px-4 py-6" />
                  <td className="border border-[#e0e4ea] px-4 py-6" />
                </tr>
              ) : (
                sites.map(site => (
                  <tr key={site.id} className="bg-white hover:bg-[#eaf6ff] transition">
                    <td className="border border-[#e0e4ea] px-4 py-2">{site.name}</td>
                    <td className="border border-[#e0e4ea] px-4 py-2">{site.masterNode || "-"}</td>
                    <td className="border border-[#e0e4ea] px-4 py-2">{site.slaveNode || "-"}</td>
                    <td className="border border-[#e0e4ea] px-4 py-2">{site.status || "-"}</td>
                    <td className="border border-[#e0e4ea] px-4 py-2 text-blue-600 cursor-pointer hover:underline">수정</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      );
    }

    export default function SitePage() {
      const [sites, setSites] = useState([]);

      useEffect(() => {
        fetch(`${API_BASE_URL}/api/site/site`)
          .then((res) => res.json())
          .then((data) => setSites(data.sites || []));
      }, []);

      return (
        <div className="min-h-screen bg-gradient-to-br from-[#eaf6ff] via-[#f5faff] to-[#e3eafc] p-10">
          <SiteTable sites={sites} />
        </div>
      );
    }
