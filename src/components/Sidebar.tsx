'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Library,
  PlusCircle,
  RotateCcw,
  Brain,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/', label: '首页', icon: LayoutDashboard },
  { href: '/knowledge', label: '知识库', icon: Library },
  { href: '/knowledge/new', label: '新增知识', icon: PlusCircle },
  { href: '/review', label: '知识回顾', icon: RotateCcw },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/knowledge/new') return pathname === '/knowledge/new';
    if (href === '/knowledge') return pathname === '/knowledge' || (pathname.startsWith('/knowledge/') && pathname !== '/knowledge/new');
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border h-14 flex items-center px-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex items-center gap-2 ml-3">
          <Brain size={22} className="text-accent" />
          <span className="font-semibold text-base">知识库</span>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-60 bg-white border-r border-border flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-border">
          <Brain size={26} className="text-accent shrink-0" />
          <div className="ml-3">
            <h1 className="font-bold text-base leading-tight tracking-tight">MindVault</h1>
            <p className="text-[11px] text-muted leading-tight">个人知识库</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-accent text-white shadow-sm shadow-accent/25'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-foreground'
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border">
          <p className="text-[11px] text-muted">数据存储在本地浏览器</p>
        </div>
      </aside>
    </>
  );
}
