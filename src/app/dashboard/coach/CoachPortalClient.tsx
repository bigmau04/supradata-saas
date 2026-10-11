'use client';

import { useState, useEffect } from 'react';
import { getCoachPortalData, toggleCoachShift, updateCoach } from '@/app/actions/coaches';
import { UserCircle, Clock, Pencil, CheckCircle, Smartphone, Users } from 'lucide-react';

export function CoachPortalClient({ initialCoaches }: { initialCoaches: any[] }) {
  const [selectedCoachId, setSelectedCoachId] = useState<string>('');
  const [portalData, setPortalData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (selectedCoachId) {
      loadPortalData(selectedCoachId);
    } else {
      setPortalData(null);
    }
  }, [selectedCoachId]);

  const loadPortalData = async (id: string) => {
    setLoading(true);
    const res = await getCoachPortalData(id);
    if (res?.success) setPortalData(res.data);
    setLoading(false);
  };

  const handleToggleShift = async () => {
    if (!selectedCoachId) return;
    setLoading(true);
    const res = await toggleCoachShift(selectedCoachId);
    if (res?.success) {
      await loadPortalData(selectedCoachId);
    }
    setLoading(false);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCoachId) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('id', selectedCoachId);
    const res = await updateCoach(formData);
    if (res?.success) {
      await loadPortalData(selectedCoachId);
      setIsEditing(false);
    }
    setLoading(false);
  };

  const activeCoaches = initialCoaches.filter((c) => c.isActive);

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 mb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Portal del Entrenador</h1>
            <p className="text-xs text-slate-500">
              Control de turno en sala y seguimiento de alumnos asignados
            </p>
          </div>
        </div>

        <div className="max-w-xs">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Selecciona tu perfil de entrenador:
          </label>
          <select
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none bg-white font-medium"
            value={selectedCoachId}
            onChange={(e) => setSelectedCoachId(e.target.value)}
          >
            <option value="">-- Elige tu nombre --</option>
            {activeCoaches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <p className="text-center text-slate-400 text-xs py-8 animate-pulse">
          Cargando datos del entrenador...
        </p>
      )}

      {portalData && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 text-center">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                Turno en Sala
              </h2>
              <button
                onClick={handleToggleShift}
                disabled={loading}
                className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition shadow-2xs ${
                  portalData.coach.isClockedIn
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <Clock className="h-4 w-4" />
                {portalData.coach.isClockedIn ? 'Finalizar Turno en Sala' : 'Iniciar Turno en Sala'}
              </button>
              {portalData.coach.isClockedIn && portalData.coach.lastClockIn && (
                <p className="text-[11px] text-slate-500 mt-2">
                  Activo desde las{' '}
                  {new Date(portalData.coach.lastClockIn).toLocaleTimeString('es-CO', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Ficha Técnica
                </h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-1 text-slate-500 hover:text-slate-900 rounded"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>

              {!isEditing ? (
                <div className="space-y-2 text-xs">
                  <p>
                    <span className="font-semibold text-slate-500">Especialidad:</span>{' '}
                    <span className="text-slate-900">{portalData.coach.specialty || 'General'}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-500">Teléfono:</span>{' '}
                    <span className="text-slate-900 font-mono">
                      {portalData.coach.phone || '—'}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-500">Horario:</span>{' '}
                    <span className="text-slate-900">
                      {portalData.coach.scheduleDetails || '—'}
                    </span>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEditSubmit} className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Especialidad
                    </label>
                    <input
                      name="specialty"
                      defaultValue={portalData.coach.specialty}
                      className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-md outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      WhatsApp
                    </label>
                    <input
                      name="phone"
                      defaultValue={portalData.coach.phone}
                      className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-md outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Horario
                    </label>
                    <textarea
                      name="scheduleDetails"
                      defaultValue={portalData.coach.scheduleDetails}
                      rows={2}
                      className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-md outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white text-xs font-semibold py-1.5 rounded-md hover:bg-slate-800 transition"
                  >
                    Guardar
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 h-full">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Alumnos Asignados (
                  {portalData.assignedMembers.length})
                </h2>
              </div>

              <div className="space-y-2">
                {portalData.assignedMembers.map((m: any) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
                  >
                    <div>
                      <h3 className="font-semibold text-xs text-slate-900">{m.fullName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {m.isInRoom && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            En sala ahora
                          </span>
                        )}
                      </div>
                    </div>
                    {m.phone && (
                      <a
                        href={`https://wa.me/57${m.phone.replace(/\D/g, '').slice(-10)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition"
                        title="Contactar vía WhatsApp"
                      >
                        <Smartphone className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))}
                {portalData.assignedMembers.length === 0 && (
                  <p className="text-slate-400 text-center text-xs py-8">
                    No tienes alumnos asignados actualmente.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
