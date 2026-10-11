import { getDashboardMetrics, getGymLiveMetrics } from '@/app/actions/dashboard';
import { DollarSign, Activity, TrendingUp, Users, ArrowUpRight, ShieldCheck, QrCode } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();
  const liveMetrics = await getGymLiveMetrics();

  const formatMoney = (val: number | string) => {
    const num = Number(val) || 0;
    return num.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Panel Gerencial</h1>
          <p className="text-xs text-slate-500">
            Resumen consolidado de operaciones, recaudos de caja y aforo en sala
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/reception"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>Abrir Recepción</span>
          </Link>
        </div>
      </div>

      {/* Financial KPIs - Compact Linear Style */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Facturación y Actividad
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Recaudo de Hoy</span>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <DollarSign className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                {formatMoney(metrics.incomeToday)}
              </p>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                <span>Caja y pagos recibidos durante el día</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Balance del Mes</span>
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60">
                <TrendingUp className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                {formatMoney(metrics.monthBalance)}
              </p>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                <span>Ingresos acumulados del mes en curso</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Asistencias Hoy</span>
              <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60">
                <Activity className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                {metrics.attendancesToday}{' '}
                <span className="text-xs font-medium text-slate-400">validaciones</span>
              </p>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                <span>Ingresos por carnet QR o documento</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas en Vivo */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Monitoreo en Sala (Tiempo Real)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Aforo Actual</span>
              <span className="bg-blue-50 text-blue-700 border border-blue-200/60 text-xs font-medium px-2 py-0.5 rounded-full">
                En sala
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                {liveMetrics.peopleInGymCount}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Personas entrenando activamente</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Socios Activos</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-medium px-2 py-0.5 rounded-full">
                Vigentes
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                {liveMetrics.activeMembersCount}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Membresías con fecha de fin vigente</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Próximos a Vencer</span>
              <span className="bg-amber-50 text-amber-700 border border-amber-200/60 text-xs font-medium px-2 py-0.5 rounded-full">
                &le; 5 días
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                {liveMetrics.expiringSoonCount}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Socios para renovación inmediata</p>
            </div>
          </div>
        </div>
      </div>

      {/* Accesos Rápidos - High Density Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Accesos Operativos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/dashboard/reception"
            className="group bg-white hover:bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 shadow-xs transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">Recepción y Escáner</span>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Validar accesos por cámara/pistola USB y cobrar turnos de mostrador.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-medium text-slate-700">
              <span>Abrir mostrador</span>
            </div>
          </Link>

          <Link
            href="/dashboard/finances"
            className="group bg-white hover:bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 shadow-xs transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">Analítica Financiera</span>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Reportes de ventas, métodos de pago y recuperación de cartera.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-medium text-slate-700">
              <span>Ver balances</span>
            </div>
          </Link>

          <Link
            href="/dashboard/members"
            className="group bg-white hover:bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 shadow-xs transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">Gestión de Miembros</span>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Base de datos de socios, planes asignados y envío de carnets QR por WhatsApp.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-medium text-slate-700">
              <span>Administrar socios</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
