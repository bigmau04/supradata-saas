'use client';

import { useState, useRef, useEffect } from 'react';
import { Building2, ChevronDown, LogOut, Shield, User, Check } from 'lucide-react';

interface UserNavProps {
  gymName: string;
  userName: string;
  userEmail: string;
  role: string;
  logoutAction: () => Promise<void>;
}

export function UserNav({ gymName, userName, userEmail, role, logoutAction }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [gymMenuOpen, setGymMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const gymMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (gymMenuRef.current && !gymMenuRef.current.contains(event.target as Node)) {
        setGymMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const roleLabel = role === 'owner' ? 'Propietario / Admin' : 'Recepcionista';

  return (
    <div className="flex items-center gap-3">
      {/* Gym Selector */}
      <div className="relative hidden sm:block" ref={gymMenuRef}>
        <button
          onClick={() => setGymMenuOpen(!gymMenuOpen)}
          type="button"
          className="flex items-center gap-2 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-md transition-colors"
          aria-expanded={gymMenuOpen}
        >
          <Building2 className="h-3.5 w-3.5 text-slate-500" />
          <span className="max-w-[130px] truncate">{gymName}</span>
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </button>

        {gymMenuOpen && (
          <div className="absolute left-0 mt-1.5 w-48 bg-white rounded-lg shadow-lg border border-slate-200/80 py-1 z-50 text-xs">
            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Gimnasio Activo
            </div>
            <div className="px-3 py-2 flex items-center justify-between text-slate-900 bg-slate-50 font-medium">
              <span className="truncate">{gymName}</span>
              <Check className="h-3.5 w-3.5 text-slate-900 shrink-0" />
            </div>
          </div>
        )}
      </div>

      <div className="h-4 w-px bg-slate-200 hidden sm:block" />

      {/* User Menu */}
      <div className="relative" ref={userMenuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="flex items-center gap-2 p-1 text-slate-700 hover:text-slate-900 rounded-md transition-colors focus:outline-hidden"
          aria-expanded={isOpen}
          aria-label="Menú de usuario"
        >
          <div className="h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold tracking-tight shadow-xs">
            {initials}
          </div>
          <span className="hidden lg:inline text-xs font-medium text-slate-800 max-w-[110px] truncate">
            {userName}
          </span>
          <ChevronDown className="h-3 w-3 text-slate-400 hidden lg:inline" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-lg shadow-lg border border-slate-200/80 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="font-semibold text-slate-900 truncate">{userName}</p>
              {userEmail && <p className="text-slate-500 text-[11px] truncate">{userEmail}</p>}
              <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                {role === 'owner' ? (
                  <Shield className="h-3 w-3 text-slate-700" />
                ) : (
                  <User className="h-3 w-3 text-slate-500" />
                )}
                <span>{roleLabel}</span>
              </div>
            </div>

            <div className="py-1">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors font-medium"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
