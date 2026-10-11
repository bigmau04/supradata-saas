'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, X, ArrowRight } from 'lucide-react';

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
    <div className="bg-slate-900 text-white border-b border-slate-800 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-md bg-slate-800 text-amber-300 shrink-0">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="font-semibold text-slate-100">Guía de Inicio Rápido:</span>{' '}
            <span className="text-slate-400">
              1. Crea tus tarifas en{' '}
              <Link href="/dashboard/plans" className="text-white underline hover:text-slate-200">
                Planes
              </Link>{' '}
              · 2. Registra socios o cobra visitas en{' '}
              <Link
                href="/dashboard/reception"
                className="text-white underline hover:text-slate-200"
              >
                Recepción
              </Link>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <Link
            href="/dashboard/plans"
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-slate-900 hover:bg-slate-100 rounded-md text-[11px] font-semibold transition"
          >
            Configurar Planes <ArrowRight className="h-3 w-3" />
          </Link>
          <button
            onClick={handleDismiss}
            aria-label="Cerrar guía"
            className="p-1 text-slate-400 hover:text-white transition rounded"
            title="Descartar guía de bienvenida"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
