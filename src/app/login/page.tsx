import Link from 'next/link';
import { LoginClient } from './LoginClient';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/25 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-blue-100/90 rounded-2xl shadow-[0_8px_30px_rgba(219,234,254,0.35)] p-8 sm:p-10 transition-all">
        <div className="bg-blue-50 text-blue-700 border border-blue-200/60 text-[10px] font-mono tracking-wider px-2.5 py-0.5 rounded-full w-fit mx-auto mb-3">
          [ SUPRADATA / ACCESO ]
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 text-center">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-slate-500 text-center mt-1 mb-6">
            Accede a la consola de administración de tu mostrador
          </p>
        </div>
        
        <LoginClient />

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-500">
            ¿No tienes una cuenta aún?{' '}
            <Link href="/register" className="text-blue-600 font-semibold hover:underline">
              [ Regístrate aquí ]
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
