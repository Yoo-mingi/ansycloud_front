"use client";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import Image from "next/image";

function ScriptTable({ scripts }) {
  return (
    <div className="w-full max-w-5xl mx-auto mt-12">
      <div className="flex justify-end mb-2">
        <a href="/script/create" className="bg-[#eaf6ff] hover:bg-[#cce6ff] text-gray-800 font-semibold py-2 px-6 rounded shadow">스크립트 생성</a>
      </div>
      <table className="w-full border border-[#e0e4ea] bg-[#f5faff] rounded-lg overflow-hidden">
        <thead className="bg-[#eaf6ff]">
          <tr>
            <th className="border border-[#e0e4ea] px-4 py-2 font-semibold">상태</th>
            <th className="border border-[#e0e4ea] px-4 py-2 font-semibold">스크립트 명</th>
            <th className="border border-[#e0e4ea] px-4 py-2 font-semibold">최종실행 날자</th>
          </tr>
        </thead>
        <tbody>
          {scripts.length === 0 ? (
            <tr className="bg-white">
              <td className="border border-[#e0e4ea] px-4 py-6" />
              <td className="border border-[#e0e4ea] px-4 py-6" />
              <td className="border border-[#e0e4ea] px-4 py-6" />
            </tr>
          ) : (
            scripts.map(script => (
              <tr key={script.id} className="bg-white hover:bg-[#eaf6ff] transition">
                <td className="border border-[#e0e4ea] px-4 py-2 text-center">
                  {script.script_result === "success" ? (
                    <span className="inline-block"><Image src="/success.png" alt="성공" width={32} height={32} /></span>
                  ) : (
                    <span className="inline-block"><Image src="/fail.png" alt="실패" width={32} height={32} /></span>
                  )}
                </td>
                <td className="border border-[#e0e4ea] px-4 py-2 cursor-pointer text-blue-700 hover:underline">
                  <a href={`/script/${script.id}`}>{script.name}</a>
                </td>
                <td className="border border-[#e0e4ea] px-4 py-2 text-center">{script.last_run_date || '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function ScriptPage() {
  const [scripts, setScripts] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/script`)
      .then(res => res.json())
      .then(data => setScripts(data.scripts || []));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eaf6ff] via-[#f5faff] to-[#e3eafc] p-10">
      <ScriptTable scripts={scripts} />
    </div>
  );
}
