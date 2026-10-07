'use client';

import { useState } from 'react';
import { createStaffUser } from '@/app/actions/team';
import { UserPlus, Shield, User, X } from 'lucide-react';

export function TeamClient({ initialMembers }: { initialMembers: any[] }) {
  const [members, setMembers] = useState(initialMembers);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const res = await createStaffUser(formData);
    
    if (res?.success === false) {
      setError(res.message);
      setLoading(false);
    } else {
      window.location.reload(); // Quick refresh to show new user
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2"
        >
          <UserPlus size={20} />
          + Nuevo Usuario / Recepcionista
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Nombre</th>
              <th className="p-4 font-semibold text-gray-600">Correo Electrónico</th>
              <th className="p-4 font-semibold text-gray-600">Rol</th>
              <th className="p-4 font-semibold text-gray-600">Registro</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">{m.fullName}</td>
                <td className="p-4 text-gray-600">{m.email}</td>
                <td className="p-4">
                  {m.role === 'owner' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                      <Shield size={14} /> Administrador
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                      <User size={14} /> Recepción
                    </span>
                  )}
                </td>
                <td className="p-4 text-gray-500 text-sm">
                  {new Date(m.createdAt).toLocaleDateString('es-CO')}
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 sm:p-6 relative max-h-[90dvh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Nuevo Personal</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input name="fullName" required className="w-full border p-2 rounded-lg" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input name="email" type="email" required className="w-full border p-2 rounded-lg" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Inicial</label>
                <input name="password" type="password" required className="w-full border p-2 rounded-lg" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select name="role" required className="w-full border p-2 rounded-lg bg-white">
                  <option value="receptionist">Recepcionista</option>
                  <option value="owner">Administrador</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition mt-4">
                {loading ? 'Creando...' : 'Crear Usuario'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
