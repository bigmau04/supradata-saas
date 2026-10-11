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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
        <input 
          name="email" 
          type="email" 
          required 
          placeholder="tucorreo@gym.com" 
          className="w-full rounded-xl p-3 text-slate-900 font-medium placeholder:text-slate-400 bg-white [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset] [&:-webkit-autofill]:text-fill-slate-900 border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
        <div className="relative w-full">
          <input 
            name="password" 
            type={showPassword ? 'text' : 'password'} 
            required 
            placeholder="••••••••"
            className="w-full rounded-xl p-3 pr-11 text-slate-900 font-medium placeholder:text-slate-400 bg-white [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset] [&:-webkit-autofill]:text-fill-slate-900 border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none" 
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      
      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg mt-4 text-lg">
        {loading ? 'Iniciando sesión...' : 'Ingresar'}
      </button>
    </form>
  );
}
