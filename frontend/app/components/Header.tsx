'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b-2 border-[#333333] bg-[#0A0A0A]">
      <div className="container mx-auto px-4">
        <div className="grid-container" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
          <div className="py-6">
            <Link href="/">
              <h2 className="text-2xl tactical-frame">TELECONSULT</h2>
            </Link>
          </div>

          <nav className="flex items-center justify-center gap-8 py-6">
            <Link 
              href="/appointments" 
              className={pathname === '/appointments' ? 'status-alert' : ''}
            >
              APPOINTMENTS
            </Link>
            <Link 
              href="/consultants" 
              className={pathname === '/consultants' ? 'status-alert' : ''}
            >
              CONSULTANTS
            </Link>
            <Link 
              href="/dashboard" 
              className={pathname === '/dashboard' ? 'status-alert' : ''}
            >
              DASHBOARD
            </Link>
          </nav>

          <div className="flex items-center gap-4 py-6">
            <Link href="/login" className="hover:text-[#E61919] transition-colors">
              LOGIN
            </Link>
            <span className="text-[#333333]">///</span>
            <Link href="/register" className="hover:text-[#E61919] transition-colors">
              REGISTER
            </Link>
          </div>
        </div>
      </div>

      {/* System Status Bar */}
      <div className="border-t border-[#333333] bg-[#121212] px-4 py-2 text-xs text-[#888888]">
        <div className="container mx-auto flex justify-between">
          <div>
            <span className="status-active">●</span> SYSTEM ONLINE
          </div>
          <div>
            REV 1.0 / BUILD 2026-10-12
          </div>
          <div>
            SECURE CONNECTION ESTABLISHED
          </div>
        </div>
      </div>
    </header>
  );
}
