'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Site', path: '/site' },
  { name: 'Script', path: '/script' },
  { name: 'Community', path: '/community' },
  { name: 'Setting', path: '/setting' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <nav className="hidden md:flex flex-col w-64 min-h-screen border-r border-[#2d3748] pt-8 px-3 bg-[#1a1f2e]">
      {navItems.map(item => (
        <Link
          key={item.path}
          href={item.path}
          passHref
          className={`px-6 py-4 mb-2 text-left transition-colors font-medium border-l-4 rounded-r-lg ${
            pathname === item.path
              ? 'bg-[#252d3d] text-[#3b82f6] border-[#3b82f6]'
              : 'text-[#9ca3af] hover:bg-[#252d3d] hover:text-[#e4e6eb] border-transparent'
          }`}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
