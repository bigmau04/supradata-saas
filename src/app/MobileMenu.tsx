"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

type NavLink = { href: string; label: string };

/**
 * Menú móvil de la landing: panel a todo el ancho bajo la barra, con fondo
 * difuminado, que se cierra al tocar un enlace, el fondo o con Escape.
 */
export default function MobileMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="menu-movil"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors active:bg-slate-100"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-x-0 bottom-0 top-16 z-40 cursor-default bg-slate-900/25 backdrop-blur-sm"
          />
          <nav
            id="menu-movil"
            aria-label="Menú móvil"
            className="fixed inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10"
          >
            <ul className="space-y-1">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3.5 text-base font-semibold text-slate-800 active:bg-slate-100"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid gap-2.5 border-t border-slate-100 pt-4">
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-base font-semibold text-white shadow-sm active:bg-blue-700"
              >
                Crear Gimnasio Gratis <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base font-semibold text-slate-800 active:bg-slate-50"
              >
                Iniciar Sesión
              </Link>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
