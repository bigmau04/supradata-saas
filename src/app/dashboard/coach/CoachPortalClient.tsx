'use client';

import { useState, useEffect } from 'react';
import { getCoachPortalData, toggleCoachShift, updateCoach } from '@/app/actions/coaches';
import { UserCircle, Clock, Edit, CheckCircle, Smartphone, Users } from 'lucide-react';

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

  const activeCoaches = initialCoaches.filter(c => c.isActive);

  return (
    <div className="max-w-4xl mx-auto font-sans p-4">
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-4">
          <UserCircle className="text-blue-600" size={32} />
          Portal del Entrenador
        </h1>
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona tu perfil:</label>
          <select 
            className="w-full border-2 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
            value={selectedCoachId}
            onChange={(e) => setSelectedCoachId(e.target.value)}
          >
            <option value="">-- Seleccionar --</option>
            {activeCoaches.map(c => (
              <option key={c.id} value={c.id}>{c.fullName}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="text-center text-gray-500 my-8">Cargando...</p>}

      {portalData && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6 text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Turno en Sala</h2>
              <button 
                onClick={handleToggleShift}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition ${
                  portalData.coach.isClockedIn 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200' 
                  : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <Clock size={24} />
                {portalData.coach.isClockedIn ? '🔴 Finalizar Turno' : '🟢 Iniciar Turno en Sala'}
              </button>
              {portalData.coach.isClockedIn && portalData.coach.lastClockIn && (
                <p className="text-xs text-gray-500 mt-4">
                  En turno desde las {new Date(portalData.coach.lastClockIn).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">Mi Perfil</h2>
                <button onClick={() => setIsEditing(!isEditing)} className="text-blue-600 hover:underline"><Edit size={18} /></button>
              </div>
              
              {!isEditing ? (
                <div className="space-y-3 text-sm">
                  <p><span className="font-semibold text-gray-500">Especialidad:</span> {portalData.coach.specialty}</p>
                  <p><span className="font-semibold text-gray-500">Teléfono:</span> {portalData.coach.phone}</p>
                  <p><span className="font-semibold text-gray-500">Horario:</span> {portalData.coach.scheduleDetails}</p>
                </div>
              ) : (
                <form onSubmit={handleEditSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Especialidad</label>
                    <input name="specialty" defaultValue={portalData.coach.specialty} className="w-full border rounded-lg p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">WhatsApp</label>
                    <input name="phone" defaultValue={portalData.coach.phone} className="w-full border rounded-lg p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Horario</label>
                    <textarea name="scheduleDetails" defaultValue={portalData.coach.scheduleDetails} className="w-full border rounded-lg p-2 text-sm" rows={2}></textarea>
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white text-sm font-bold py-2 rounded-lg">Guardar</button>
                </form>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border p-6 h-full">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Users className="text-blue-600" />
                Mis Alumnos Asignados ({portalData.assignedMembers.length})
              </h2>
              
              <div className="space-y-4">
                {portalData.assignedMembers.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between p-4 rounded-xl border hover:bg-gray-50 transition">
                    <div>
                      <h3 className="font-bold text-gray-800">{m.fullName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {m.phone && (
                          <a href={`https://wa.me/57${m.phone.replace(/\D/g, '').slice(-10)}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                            <Smartphone size={14} /> Contactar
                          </a>
                        )}
                        {m.isInRoom && (
                          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle size={10} /> En sala ahora
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {portalData.assignedMembers.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No tienes alumnos asignados actualmente.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
