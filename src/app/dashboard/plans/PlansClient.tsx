'use client';

import { useState } from 'react';
import { createPlan, togglePlanStatus } from '@/app/actions/plans';
import { Plus, X, CalendarDays, Info } from 'lucide-react';

export function PlansClient({ initialPlans }: { initialPlans: any[] }) {
  const [plans, setPlans] = useState(initialPlans);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createPlan(formData);
    if (res?.success) window.location.reload();
    setLoading(false);
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    await togglePlanStatus(id, !currentStatus);
    window.location.reload();
  };

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={20} /> Nuevo Plan
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Nombre del Plan</th>
              <th className="p-4 font-semibold text-gray-600">Duración</th>
              <th className="p-4 font-semibold text-gray-600">Precio</th>
              <th className="p-4 font-semibold text-gray-600">Estado</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => {
              const isSystemPlan = p.name === 'Pase Diario Exprés' && p.durationDays === 1;
              return (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium flex items-center gap-2">
                  <CalendarDays size={18} className="text-gray-400" />
                  {p.name}
                  {isSystemPlan && (
                    <span className="ml-2 inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Sistema / Pase Rápido
                    </span>
                  )}
                </td>
                <td className="p-4 text-gray-600">{p.durationDays} días</td>
                <td className="p-4 font-semibold text-gray-800">${Number(p.price).toLocaleString('es-CO')}</td>
                <td className="p-4">
                  {p.isActive ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Activo</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">Inactivo</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  {!isSystemPlan && (
                    <button onClick={() => handleToggle(p.id, p.isActive)} className={`text-sm font-medium hover:underline ${p.isActive ? 'text-red-600' : 'text-blue-600'}`}>
                      {p.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                  )}
                </td>
              </tr>
            )})}
          </tbody>
        </table></div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 sm:p-6 relative max-h-[90dvh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X size={24} /></button>
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <CalendarDays className="text-blue-600" /> Nuevo Plan Comercial
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre (ej. Plan Mensual)</label>
                <input name="name" required className="w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duración (días)</label>
                  <input name="durationDays" type="number" required placeholder="30" className="w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                  <input name="price" type="number" required placeholder="70000" className="w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Notas (Opcional)</label>
                <textarea name="description" className="w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none" rows={2} placeholder="Incluye acceso full y zonas húmedas..."></textarea>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg mt-6 text-lg">
                {loading ? 'Guardando...' : 'Crear Plan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
