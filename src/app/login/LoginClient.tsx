'use client';
import { useState } from 'react';
import { loginAction } from '@/app/actions/login';
import { Eye, EyeOff } from 'lucide-react';

export function LoginClient() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const res = await loginAction(formData);
    
    if (res?.success === false) {
      setError(res.message);
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100/70 focus:ring-emerald-500 transition-all [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset] [&:-webkit-autofill]:text-fill-slate-900 [&:-webkit-autofill]:[-webkit-text-fill-color:#0f172a]";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200/60 text-red-700 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}
      
      <div>
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 block">
          Correo Electrónico
        </label>
        <input 
          name="email" 
          type="email" 
          required 
          placeholder="admin@empresa.com" 
          className={inputClass} 
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 block">
          Contraseña
        </label>
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
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm py-2.5 px-4 rounded-xl shadow-xs shadow-emerald-200 hover:shadow-md hover:shadow-emerald-200/50 transition-all active:scale-[0.99] flex items-center justify-center cursor-pointer disabled:opacity-50 mt-2"
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
}
