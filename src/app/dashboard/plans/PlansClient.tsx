'use client';

import { useState } from 'react';
import { createPlan, togglePlanStatus, updateMembershipPlan } from '@/app/actions/plans';
import { Plus, X, CalendarDays, Pencil, Power, Check } from 'lucide-react';

export function PlansClient({ initialPlans }: { initialPlans: any[] }) {
  const [plans, setPlans] = useState(initialPlans);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editPlan, setEditPlan] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createPlan(formData);
    if (res?.success) window.location.reload();
    setLoading(false);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateMembershipPlan(formData);
    if (res?.success) {
      window.location.reload();
    } else {
      alert(res?.error || 'Error al actualizar plan');
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    await togglePlanStatus(id, !currentStatus);
    window.location.reload();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Gestión de Planes</h1>
          <p className="text-xs text-slate-500">
            Catálogo de membresías, tarifas y duraciones de acceso
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Nuevo Plan</span>
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3 px-4 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Nombre del Plan</th>
                <th className="py-3 px-4">Duración</th>
                <th className="py-3 px-4">Precio</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {plans.map((p) => {
                const isSystemPlan = p.name === 'Pase Diario Exprés' && p.durationDays === 1;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200/60">
                          <CalendarDays className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block leading-tight">
                            {p.name}
                          </span>
                          {p.description && (
                            <span className="text-xs text-slate-400 truncate max-w-xs block">
                              {p.description}
                            </span>
                          )}
                        </div>
                        {isSystemPlan && (
                          <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                            Pase Rápido
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-600 tabular-nums">
                      {p.durationDays} días
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">
                      ${Number(p.price).toLocaleString('es-CO')}
                    </td>
                    <td className="py-3 px-4">
                      {p.isActive ? (
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
                      {!isSystemPlan && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditPlan(p)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
                            title="Editar plan"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggle(p.id, p.isActive)}
                            className={`p-1.5 rounded-md transition ${
                              p.isActive
                                ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={p.isActive ? 'Desactivar plan' : 'Activar plan'}
                          >
                            <Power className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {plans.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 px-4 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center justify-center">
                      <div className="h-10 w-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center mb-3 border border-slate-200/80">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Aún no tienes planes comerciales
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 mb-4">
                        Crea tu primer plan (ej. Mensualidad, Pase Libre) para empezar a cobrar membresías.
                      </p>
                      <button
                        onClick={() => setShowModal(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3.5 rounded-lg transition"
                      >
                        + Crear Primer Plan
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Crear Plan */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 w-full max-w-md max-h-[90dvh] overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-900">Nuevo Plan Comercial</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nombre del Plan *
                </label>
                <input
                  name="name"
                  required
                  placeholder="Ej. Plan Mensual Full"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Duración (días) *
                  </label>
                  <input
                    name="durationDays"
                    type="number"
                    required
                    placeholder="30"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Precio ($) *
                  </label>
                  <input
                    name="price"
                    type="number"
                    required
                    placeholder="70000"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none tabular-nums font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Descripción (Opcional)
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Acceso ilimitado a pesas y cardiovascular..."
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
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-60 transition shadow-2xs"
                >
                  {loading ? 'Guardando...' : 'Crear Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Editar Plan */}
      {editPlan && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 w-full max-w-md max-h-[90dvh] overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-900">Editar Plan Comercial</h2>
              <button onClick={() => setEditPlan(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <input type="hidden" name="id" value={editPlan.id} />
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nombre del Plan *
                </label>
                <input
                  name="name"
                  required
                  defaultValue={editPlan.name}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Duración (días) *
                  </label>
                  <input
                    name="durationDays"
                    type="number"
                    required
                    defaultValue={editPlan.durationDays}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Precio ($) *
                  </label>
                  <input
                    name="price"
                    type="number"
                    required
                    defaultValue={editPlan.price}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none tabular-nums font-semibold"
                  />
                </div>
              </div>
              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setEditPlan(null)}
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
