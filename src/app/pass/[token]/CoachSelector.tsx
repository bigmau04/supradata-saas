'use client';

import { useState, useTransition } from 'react';
import { updateMemberCoachByToken } from '@/app/actions/members';

export function CoachSelector({ token, currentCoachId, coaches }: { token: string, currentCoachId: string | null, coaches: any[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="w-full mt-6 border-t pt-6">
      <h3 className="text-center text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Tu Entrenador Asignado</h3>
      <select 
        className="w-full border-2 rounded-xl p-3 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-100 transition disabled:opacity-50"
        defaultValue={currentCoachId || ''}
        disabled={isPending}
        onChange={(e) => {
          startTransition(async () => {
            const val = e.target.value === '' ? null : e.target.value;
            await updateMemberCoachByToken(token, val);
          });
        }}
      >
        <option value="">-- Sin entrenador --</option>
        {coaches.map(c => (
          <option key={c.id} value={c.id}>{c.fullName} - {c.specialty || 'General'}</option>
        ))}
      </select>
      {isPending && <p className="text-xs text-center text-blue-500 mt-2">Guardando...</p>}
    </div>
  );
}
