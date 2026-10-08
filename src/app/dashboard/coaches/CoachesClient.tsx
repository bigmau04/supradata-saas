'use client';
import { useState } from 'react';
import { createCoach, toggleCoachStatus, updateCoach } from '@/app/actions/coaches';
import { Users, Plus, X, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CoachesClient({ initialCoaches }: { initialCoaches: any[] }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editCoach, setEditCoach] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filterActive, setFilterActive] = useState(true);

  const filteredCoaches = initialCoaches.filter(c => c.isActive === filterActive);

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Users className="text-blue-600" size={32} />
            Gestión de Entrenadores
          </h1>
          <p className="text-gray-500 mt-2">Administra tu equipo, horarios y especialidades.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-md flex items-center gap-2 transition">
          <Plus size={20} /> Nuevo Entrenador
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setFilterActive(true)}
          className={`px-6 py-2 rounded-full font-bold transition ${filterActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
        >
          Activos
        </button>
        <button 
          onClick={() => setFilterActive(false)}
          className={`px-6 py-2 rounded-full font-bold transition ${!filterActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
        >
          Inactivos / Retirados
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-600">Nombre</th>
              <th className="px-6 py-4 font-medium text-gray-600">Especialidad</th>
              <th className="px-6 py-4 font-medium text-gray-600">Teléfono</th>
              <th className="px-6 py-4 font-medium text-gray-600 text-center">Alumnos Asignados</th>
              <th className="px-6 py-4 font-medium text-gray-600 text-center">En Sala</th>
              <th className="px-6 py-4 font-medium text-gray-600">Horario</th>
              <th className="px-6 py-4 font-medium text-gray-600">Estado</th>
              <th className="px-6 py-4 font-medium text-gray-600 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredCoaches.map((coach) => (
              <tr key={coach.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-bold text-gray-800">
                  {coach.fullName}
                  {coach.documentId && <span className="block text-xs font-normal text-gray-400">CC: {coach.documentId}</span>}
                </td>
                <td className="px-6 py-4 text-gray-600">{coach.specialty}</td>
                <td className="px-6 py-4 text-gray-600">{coach.phone}</td>
                <td className="px-6 py-4 text-center">
                  <span className="font-bold text-lg text-gray-800">{coach.assignedStudents || 0}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-bold text-lg text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{coach.inRoomStudents || 0}</span>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">{coach.scheduleDetails}</td>
                <td className="px-6 py-4">
                  {coach.isActive ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Activo</span>
                  ) : (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Inactivo</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => setEditCoach(coach)} className="text-sm font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1">
                      <Edit size={16} /> Editar
                    </button>
                    <button 
                      onClick={() => toggleCoachStatus(coach.id, coach.isActive)} 
                      className={`text-sm font-semibold transition ${coach.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                    >
                      {coach.isActive ? 'Desactivar' : 'Reactivar Entrenador'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCoaches.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-500 font-medium">
                  {filterActive ? 'No hay entrenadores activos.' : 'No hay entrenadores retirados.'}
                </td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-5 sm:p-8 max-w-md w-full relative max-h-[90dvh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Entrenador</h2>
            <form action={async (formData) => { 
              const res = await createCoach(formData); 
              console.log("Respuesta de createCoach:", res);
              if (res?.error) {
                alert('Error al crear entrenador: ' + res.error);
              } else {
                setShowModal(false); 
                router.refresh();
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input name="fullName" required className="w-full border-2 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Documento</label>
                  <input name="documentId" className="w-full border-2 rounded-xl p-3 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input name="phone" className="w-full border-2 rounded-xl p-3 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                <input name="specialty" placeholder="Ej: Funcional, Pesas..." className="w-full border-2 rounded-xl p-3 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horario / Observaciones</label>
                <textarea name="scheduleDetails" className="w-full border-2 rounded-xl p-3 outline-none" rows={3}></textarea>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg mt-4">Guardar Entrenador</button>
            </form>
          </div>
        </div>
      )}

      {editCoach && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-5 sm:p-8 max-w-md w-full relative max-h-[90dvh] overflow-y-auto">
            <button onClick={() => setEditCoach(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Edit className="text-blue-600" /> Editar Entrenador</h2>
            <form action={async (formData) => { 
              setLoading(true);
              const res = await updateCoach(formData); 
              setLoading(false);
              if (res?.error) {
                alert('Error al editar: ' + res.error);
              } else {
                setEditCoach(null); 
              }
            }} className="space-y-4">
              <input type="hidden" name="id" value={editCoach.id} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input name="phone" defaultValue={editCoach.phone} className="w-full border-2 rounded-xl p-3 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                <input name="specialty" defaultValue={editCoach.specialty} className="w-full border-2 rounded-xl p-3 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horario / Observaciones</label>
                <textarea name="scheduleDetails" defaultValue={editCoach.scheduleDetails} className="w-full border-2 rounded-xl p-3 outline-none" rows={3}></textarea>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg mt-4 disabled:opacity-50">
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
