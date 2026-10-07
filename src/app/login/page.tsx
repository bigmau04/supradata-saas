import Link from 'next/link';
import { LoginClient } from './LoginClient';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Bienvenido de nuevo</h1>
          <p className="text-gray-500 mt-2">Ingresa a SupraData</p>
        </div>
        
        <LoginClient />

        <div className="mt-6 text-center border-t pt-6">
          <p className="text-sm text-gray-600">
            ¿Eres dueño de un gimnasio?{' '}
            <Link href="/register" className="text-blue-600 font-bold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
