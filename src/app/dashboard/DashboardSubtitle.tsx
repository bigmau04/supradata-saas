'use client';

import React from 'react';
import { useBranch } from '@/contexts/BranchContext';

export function DashboardSubtitle() {
  const { activeBranch } = useBranch();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 mt-1">
      <p className="text-xs text-slate-500">
        Resumen consolidado de operaciones, recaudos de caja y aforo en sala
      </p>
      <span className="text-slate-300 hidden sm:inline">•</span>
      <div className="text-xs font-semibold text-blue-700 bg-blue-50/90 px-2.5 py-0.5 rounded-md border border-blue-200/70 inline-flex items-center w-fit shadow-2xs">
        Mostrando datos financieros de: {activeBranch.name}
      </div>
    </div>
  );
}
