'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Calendar, DollarSign, X, ArrowRight } from 'lucide-react';

export default function OnboardingBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('supradata_onboarding_dismissed');
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('supradata_onboarding_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md border-b border-blue-500/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight">
                ¡Bienvenido a SupraData!
              </span>
              <span className="bg-white/20 text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Guía Rápida
              </span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
              <span className="font-semibold text-white">Paso 1:</span> Registra tu primer plan en la pestaña{' '}
              <Link href="/dashboard/plans" className="underline font-bold text-white hover:text-amber-200">
                Planes
              </Link>
              . <span className="font-semibold text-white ml-1">Paso 2:</span> Realiza tu primer cobro en{' '}
              <Link href="/dashboard/reception" className="underline font-bold text-white hover:text-amber-200">
                Recepción
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <Link
            href="/dashboard/plans"
            className="flex items-center gap-1.5 bg-white text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition"
          >
            Configurar Planes <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={handleDismiss}
            aria-label="Cerrar guía"
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition"
            title="Descartar guía de bienvenida"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
