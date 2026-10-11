'use client';

import { useState, useRef } from 'react';
import { createCoach, toggleCoachStatus, updateCoach } from '@/app/actions/coaches';
import { Users, Plus, X, Pencil, Power } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CoachesClient({ initialCoaches }: { initialCoaches: any[] }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editCoach, setEditCoach] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filterActive, setFilterActive] = useState(true);
  const createFormRef = useRef<HTMLFormElement>(null);

  const filteredCoaches = initialCoaches.filter((c) => c.isActive === filterActive);

  return (
    <div className="space-y-6 font-sans">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Gestión de Entrenadores</h1>
          <p className="text-xs text-slate-500">
            Control de preparadores físicos, especialidades y alumnos asignados
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Nuevo Entrenador</span>
        </button>
      </div>

      {/* TABS FILTER */}
      <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setFilterActive(true)}
          className={`py-1.5 px-3 text-xs font-semibold rounded-md transition-all ${
            filterActive ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Activos ({initialCoaches.filter((c) => c.isActive).length})
        </button>
        <button
          type="button"
          onClick={() => setFilterActive(false)}
          className={`py-1.5 px-3 text-xs font-semibold rounded-md transition-all ${
            !filterActive ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Inactivos ({initialCoaches.filter((c) => !c.isActive).length})
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3 px-4 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Entrenador</th>
                <th className="py-3 px-4">Especialidad</th>
                <th className="py-3 px-4">Teléfono</th>
                <th className="py-3 px-4 text-center">Alumnos</th>
                <th className="py-3 px-4 text-center">En Sala</th>
                <th className="py-3 px-4">Horario</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredCoaches.map((coach) => (
                <tr key={coach.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200/60">
                        {coach.fullName
                          ?.split(' ')
                          .map((n: string) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </div>
                      <div>
                        <span>{coach.fullName}</span>
                        {coach.documentId && (
                          <span className="block text-xs font-mono text-slate-400">
                            CC: {coach.documentId}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600">{coach.specialty || 'General'}</td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-600">
                    {coach.phone || '—'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-semibold text-xs tabular-nums text-slate-800">
                      {coach.assignedCount ?? coach.assignedStudents ?? 0}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block font-semibold text-xs tabular-nums text-slate-800 px-2 py-0.5 rounded-md bg-slate-100">
                      {coach.inGymCount ?? coach.inRoomStudents ?? 0}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500 max-w-[180px] truncate">
                    {coach.scheduleDetails || '—'}
                  </td>
                  <td className="py-3 px-4">
                    {coach.isActive ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-medium px-2 py-0.5 rounded-full">
                        Activo
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 border border-slate-200/60 text-xs font-medium px-2 py-0.5 rounded-full">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditCoach(coach)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
                        title="Editar entrenador"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleCoachStatus(coach.id, coach.isActive)}
                        className={`p-1.5 rounded-md transition ${
                          coach.isActive
                            ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={coach.isActive ? 'Desactivar entrenador' : 'Reactivar entrenador'}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCoaches.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center justify-center">
                      <div className="h-10 w-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center mb-3 border border-slate-200/80">
                        <Users className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {filterActive
                          ? 'No hay entrenadores activos registrados'
                          : 'No hay entrenadores inactivos'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 mb-4">
                        {filterActive
                          ? 'Registra tus preparadores físicos para asignarles alumnos y seguimiento.'
                          : 'Todos los preparadores están activos actualmente.'}
                      </p>
                      {filterActive && (
                        <button
                          onClick={() => setShowModal(true)}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3.5 rounded-lg transition"
                        >
                          + Registrar Entrenador
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Nuevo Entrenador */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 w-full max-w-md max-h-[90dvh] overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-900">Nuevo Entrenador</h2>
              <button
                onClick={() => {
                  createFormRef.current?.reset();
                  setShowModal(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              ref={createFormRef}
              action={async (formData) => {
                const res = await createCoach(formData);
                if (res?.error) {
                  alert('Error al crear entrenador: ' + res.error);
                } else {
                  createFormRef.current?.reset();
                  setShowModal(false);
                  router.refresh();
                }
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  name="fullName"
                  required
                  placeholder="Ej. Carlos Mendoza"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Documento</label>
                  <input
                    name="documentId"
                    placeholder="10203040"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Teléfono</label>
                  <input
                    name="phone"
                    placeholder="3001234567"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Especialidad</label>
                <input
                  name="specialty"
                  placeholder="Ej. Funcional, Musculación, Crossfit"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Horario / Observaciones
                </label>
                <textarea
                  name="scheduleDetails"
                  rows={2}
                  placeholder="Lunes a Viernes 6am - 2pm"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>
              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition shadow-2xs"
                >
                  Guardar Entrenador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Editar Entrenador */}
      {editCoach && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 w-full max-w-md max-h-[90dvh] overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-900">Editar Entrenador</h2>
              <button onClick={() => setEditCoach(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              action={async (formData) => {
                setLoading(true);
                const res = await updateCoach(formData);
                setLoading(false);
                if (res?.error) {
                  alert('Error al editar: ' + res.error);
                } else {
                  setEditCoach(null);
                }
              }}
              className="space-y-3.5"
            >
              <input type="hidden" name="id" value={editCoach.id} />
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Teléfono</label>
                <input
                  name="phone"
                  defaultValue={editCoach.phone}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Especialidad</label>
                <input
                  name="specialty"
                  defaultValue={editCoach.specialty}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Horario / Observaciones
                </label>
                <textarea
                  name="scheduleDetails"
                  rows={2}
                  defaultValue={editCoach.scheduleDetails}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>
              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setEditCoach(null)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-60 transition shadow-2xs"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
