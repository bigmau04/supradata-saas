import { getDashboardMetrics, getGymLiveMetrics } from '@/app/actions/dashboard';
import { DollarSign, Activity, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();
  const liveMetrics = await getGymLiveMetrics();

  const formatMoney = (val: number | string) => {
    const num = Number(val) || 0;
    return num.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Panel Gerencial</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-100 text-green-600 rounded-xl"><DollarSign size={32} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Recaudo de Hoy</p>
            <p className="text-3xl font-bold text-gray-800">{formatMoney(metrics.incomeToday)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-xl"><TrendingUp size={32} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Balance del Mes</p>
            <p className="text-3xl font-bold text-gray-800">{formatMoney(metrics.monthBalance)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-xl"><Activity size={32} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Asistencias Hoy</p>
            <p className="text-3xl font-bold text-gray-800">{metrics.attendancesToday} <span className="text-sm font-normal text-gray-500">accesos</span></p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6 text-gray-800">Métricas en Vivo</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Aforo Actual</span>
          <p className="text-4xl font-black text-blue-600">{liveMetrics.peopleInGymCount}</p>
          <p className="text-sm text-gray-400">Personas entrenando ahora</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Socios Activos</span>
          <p className="text-4xl font-black text-green-600">{liveMetrics.activeMembersCount}</p>
          <p className="text-sm text-gray-400">Planes vigentes</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Próximos a Vencer</span>
          <p className="text-4xl font-black text-orange-500">{liveMetrics.expiringSoonCount}</p>
          <p className="text-sm text-gray-400">Vencen en &le; 5 días</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6 text-gray-800">Accesos Rápidos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/dashboard/reception" className="bg-gray-900 text-white p-6 rounded-2xl shadow-md hover:bg-black transition flex flex-col gap-3">
          <span className="text-lg font-bold">Recepción y Escáner</span>
          <span className="text-sm text-gray-400">Validar carnets y dar acceso a socios</span>
        </Link>
        <Link href="/dashboard/finance" className="bg-blue-600 text-white p-6 rounded-2xl shadow-md hover:bg-blue-700 transition flex flex-col gap-3">
          <span className="text-lg font-bold">Finanzas y Caja</span>
          <span className="text-sm text-blue-200">Registrar pagos, gastos y cuadrar turnos</span>
        </Link>
        <Link href="/dashboard/members" className="bg-white border border-gray-200 text-gray-800 p-6 rounded-2xl shadow-sm hover:border-blue-500 transition flex flex-col gap-3">
          <span className="text-lg font-bold">Gestión de Miembros</span>
          <span className="text-sm text-gray-500">Crear socios, enviar QR por WhatsApp</span>
        </Link>
      </div>
    </div>
  );
}
