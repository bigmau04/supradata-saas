import { RegisterClient } from './RegisterClient';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-emerald-100/90 rounded-2xl shadow-[0_8px_30px_rgba(16,185,129,0.08)] p-8 sm:p-10 transition-all">
        <div className="bg-emerald-50 text-emerald-600 border border-emerald-200/60 text-[10px] font-mono tracking-wider px-2.5 py-0.5 rounded-full w-fit mx-auto mb-3">
          [ SUPRADATA / ACCESO ]
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 text-center">
            Crear Cuenta Comercial
          </h1>
          <p className="text-xs text-slate-500 text-center mt-1 mb-6">
            Registra tu establecimiento y activa la prueba operativa
          </p>
        </div>
        
        <RegisterClient />

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-500">
            ¿Ya tienes una cuenta comercial?{' '}
            <Link href="/login" className="text-emerald-600 font-semibold hover:text-emerald-500 hover:underline">
              [ Inicia sesión aquí ]
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
