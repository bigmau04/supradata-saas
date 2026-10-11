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
    <nav className="hidden md:flex items-center gap-0.5" aria-label="Navegación principal">
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all duration-200 ${
              active
                ? 'bg-blue-50 text-blue-700 border border-blue-200/60 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 hover:shadow-sm'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
