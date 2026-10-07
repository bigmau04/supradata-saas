'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Item = { href: string; label: string };

/**
 * Navegación del dashboard para móvil/tablet (< md): barra de pestañas con
 * scroll horizontal, objetivos táctiles de 44px y resaltado de la ruta activa.
 */
export default function DashboardMobileNav({ items }: { items: Item[] }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <nav
      aria-label="Navegación del panel"
      className="md:hidden border-t border-gray-100 bg-white"
    >
      <ul className="flex gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-[44px] items-center rounded-lg px-4 text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 active:bg-gray-100'
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
