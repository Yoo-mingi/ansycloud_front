'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'DashBoard', path: '/dashboard' },
  { name: 'Site', path: '/site' },
  { name: 'Script', path: '/script' },
  { name: 'Community', path: '/community' },
  { name: 'Setting', path: '/setting' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col w-52 min-h-screen border-r border-r-[#cce6ff] pt-8 bg-gradient-to-br from-[#eaf6ff] via-[#f5faff] to-[#e3eafc]">
      {navItems.map(item => (
        <Link
          key={item.path}
          href={item.path}
          passHref
          className={`px-6 py-3 text-left text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors font-medium ${pathname === item.path ? 'bg-blue-200 text-blue-800' : ''}`}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
