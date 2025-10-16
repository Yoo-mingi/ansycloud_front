import Link from 'next/link';

export default function Header() {
  return (
  <header className="flex items-center justify-between px-6 py-4 border-b border-b-[#cce6ff] bg-gradient-to-br from-[#eaf6ff] via-[#f5faff] to-[#e3eafc]">
      <div className="font-bold text-2xl">AnsyCloud</div>
      <div className="space-x-4">
        <Link href="/register" className="text-gray-700 hover:text-blue-600">Register</Link>
        <Link href="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
      </div>
    </header>
  );
}
