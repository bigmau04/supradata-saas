'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Item = { href: string; label: string };

/**
 * Mobile dashboard navigation: compact tabs with horizontal scroll
 * matching the Linear/Supabase design system.
 */
export default function DashboardMobileNav({ items }: { items: Item[] }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <nav
      aria-label="Navegación del panel móvil"
      className="md:hidden border-b border-slate-200/80 bg-white/95 backdrop-blur-md"
    >
      <ul className="flex gap-1 overflow-x-auto px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex h-8 items-center rounded-md px-3 text-xs transition-colors ${
                  active
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
