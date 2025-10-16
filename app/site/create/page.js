'use client';
import { useState } from 'react';
import { API_BASE_URL } from '../../config';
import { useRouter } from 'next/navigation';

export default function SiteCreatePage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: '', masterNodeName: '', masterNodeIP: '' });
  const router = useRouter();

  const handleNext = () => setStep(s => Math.min(s + 1, 1));
  const handleClose = () => router.push('/site');
  const handleCreate = async () => {
    await fetch(`${API_BASE_URL}/api/site/site`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        masterNodeName: form.masterNodeName,
        masterNodeIP: form.masterNodeIP,
      }),
    });
    router.push('/site');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#eaf6ff] via-[#f5faff] to-[#e3eafc]">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-xl font-bold mb-6">사이트 생성</h2>
        {step === 0 && (
          <>
            <label className="block mb-2 font-semibold">사이트 이름 <span className="text-red-500">*</span></label>
            <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 mb-6" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={handleClose}>취소</button>
              <button className="px-4 py-2 rounded bg-blue-200 text-blue-800 font-semibold" onClick={handleNext} disabled={!form.name}>다음</button>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <label className="block mb-2 font-semibold">마스터 노드 이름</label>
            <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 mb-4" value={form.masterNodeName} onChange={e => setForm(f => ({ ...f, masterNodeName: e.target.value }))} />
            <label className="block mb-2 font-semibold">마스터 노드 IP</label>
            <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 mb-6" value={form.masterNodeIP} onChange={e => setForm(f => ({ ...f, masterNodeIP: e.target.value }))} />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={handleClose}>취소</button>
              <button className="px-4 py-2 rounded bg-blue-500 text-white font-semibold" onClick={handleCreate}>생성</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
