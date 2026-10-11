'use client';
import { useState } from 'react';
import { registerGymAction } from '@/app/actions/registerGym';
import { Eye, EyeOff } from 'lucide-react';

export function RegisterClient() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100/70 transition-all [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset] [&:-webkit-autofill]:text-fill-slate-900 [&:-webkit-autofill]:[-webkit-text-fill-color:#0f172a]";
  const labelClass = "text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 block";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200/60 text-red-700 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}
      
      <div>
        <label className={labelClass}>Nombre del Establecimiento</label>
        <input 
          name="gymName" 
          required 
          placeholder="Ej. Cross Training Norte / AutoTaller Express" 
          className={inputClass} 
        />
      </div>

      <div>
        <label className={labelClass}>Tipo de Negocio</label>
        <select 
          name="businessType" 
          defaultValue="gym"
          className={`${inputClass} cursor-pointer bg-[right_0.75rem_center]`}
        >
          <option value="gym">Gimnasio / Centro Deportivo [Activo]</option>
          <option value="workshop">Taller / Servicios</option>
          <option value="gastronomy">Bar / Gastronómico</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>NIT o Cédula</label>
        <input 
          name="taxId" 
          required 
          placeholder="Ej. 900.123.456-7" 
          className={inputClass} 
        />
      </div>

      <div>
        <label className={labelClass}>Nombre del Responsable / Admin</label>
        <input 
          name="ownerName" 
          required 
          placeholder="Ej. Carlos Mendoza" 
          className={inputClass} 
        />
      </div>

      <div>
        <label className={labelClass}>Correo Electrónico</label>
        <input 
          name="email" 
          type="email" 
          required 
          placeholder="admin@empresa.com" 
          className={inputClass} 
        />
      </div>

      <div>
        <label className={labelClass}>Contraseña</label>
        <div className="relative w-full">
          <input 
            name="password" 
            type={showPassword ? 'text' : 'password'} 
            required 
            placeholder="••••••••"
            className={`${inputClass} pr-11`} 
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
            title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      
      <button 
        type="submit" 
        disabled={loading} 
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm py-2.5 px-4 rounded-xl shadow-xs shadow-blue-200 hover:shadow-md hover:shadow-blue-200/50 transition-all active:scale-[0.99] flex items-center justify-center cursor-pointer disabled:opacity-50 mt-2"
      >
        {loading ? 'Creando cuenta...' : 'Crear Cuenta Comercial'}
      </button>
    </form>
  );
}
