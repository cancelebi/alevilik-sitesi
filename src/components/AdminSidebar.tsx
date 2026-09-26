'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Yeni Makale', href: '/admin/yeni-makale', icon: '✍️' },
    { name: 'Kategoriler', href: '/admin/kategoriler', icon: '📁' },
    { name: 'Yorumlar', href: '/admin/yorumlar', icon: '💬' },
    { name: 'Deyişler / Radyo', href: '/admin/sesler', icon: '🎵' },
    { name: 'Üyeler & Yetki', href: '/admin/uyeler', icon: '👥' },
    { name: 'Ayarlar', href: '/admin/ayarlar', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-ink text-light hidden md:flex flex-col flex-shrink-0 border-r border-line-dark shadow-xl">
      <div className="h-20 flex items-center px-8 border-b border-line-light/20">
        <Link href="/" className="font-serif text-xl tracking-wide hover:text-gold transition-colors">
          Oruç<span className="text-copper">.</span>
        </Link>
      </div>

      <div className="p-6">
        <p className="text-[11px] font-mono tracking-[0.2em] text-light-dim uppercase mb-4">Yönetim</p>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-copper text-light shadow-md shadow-copper/20' 
                    : 'text-light-dim hover:bg-white/5 hover:text-light'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-line-light/20">
        <Link 
          href="/" 
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-light-dim hover:bg-white/5 hover:text-light transition-all"
        >
          <span>🏠</span>
          Siteye Dön
        </Link>
      </div>
    </aside>
  );
}
