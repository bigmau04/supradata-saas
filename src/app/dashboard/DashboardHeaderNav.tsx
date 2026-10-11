'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavItem {
  href: string;
  label: string;
}

export function DashboardHeaderNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              active
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
