'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type NavLink = { href: string; label: string };

interface MobileMenuProps {
  links: NavLink[];
  registerLabel?: string;
  loginLabel?: string;
}

export default function MobileMenu({
  links,
  registerLabel = 'Iniciar Demostración',
  loginLabel = 'Acceso Personal',
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="menu-movil"
        aria-label={open ? 'Cerrar navegación' : 'Abrir navegación'}
        className="px-2.5 py-1 text-[11px] font-mono tracking-wider uppercase font-semibold rounded border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 transition-colors"
      >
        {open ? '[ CERRAR ]' : '[ MENÚ ]'}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-x-0 bottom-0 top-14 z-40 cursor-default bg-slate-900/20 backdrop-blur-xs"
          />
          <nav
            id="menu-movil"
            aria-label="Menú móvil"
            className="fixed inset-x-0 top-14 z-50 max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-slate-200 bg-white p-5 shadow-lg"
          >
            <ul className="divide-y divide-slate-100">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block py-3 text-xs font-semibold tracking-wide uppercase text-slate-700 hover:text-slate-900"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-slate-200 grid gap-2">
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="text-center bg-slate-900 text-white text-xs font-medium py-2.5 px-4 rounded-lg hover:bg-slate-800 transition-colors"
              >
                {registerLabel}
              </Link>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-center border border-slate-300 text-slate-700 text-xs font-medium py-2.5 px-4 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {loginLabel}
              </Link>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
