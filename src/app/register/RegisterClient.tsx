'use client';
import { useState } from 'react';
import { registerGymAction } from '@/app/actions/registerGym';

export function RegisterClient() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const res = await registerGymAction(formData);
    
    if (res?.success === false) {
      setError(res.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Gimnasio</label>
        <input name="gymName" required placeholder="Ej. Mi Gimnasio" className="w-full border-2 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">NIT o Cédula (Legal)</label>
        <input name="taxId" required placeholder="Ej. 900.123.456-7" className="w-full border-2 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Dueño/Admin</label>
        <input name="ownerName" required placeholder="Ej. Juan Pérez" className="w-full border-2 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
        <input name="email" type="email" required placeholder="tucorreo@gym.com" className="w-full border-2 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
        <input name="password" type="password" required className="w-full border-2 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
      </div>
      
      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg mt-4 text-lg">
        {loading ? 'Creando...' : 'Registrar Gimnasio'}
      </button>
    </form>
  );
}
