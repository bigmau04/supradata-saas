'use client';

import { useState, useEffect, useRef } from 'react';
import { getFinancialOverview, getRevenueRecoveryData, getDailyBreakdown } from '@/app/actions/finances';
import { voidPayment } from '@/app/actions/finance';
import {
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Clock,
  Ban,
  Receipt,
  Scale,
  CheckCircle,
  AlertTriangle,
  X,
} from 'lucide-react';

export function FinancesClient({ operationalData }: { operationalData?: any }) {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [overview, setOverview] = useState<any>(null);
  const [recoveryData, setRecoveryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recoveryFilter, setRecoveryFilter] = useState<'all' | 'monthly' | 'yearly'>('all');

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [breakdownData, setBreakdownData] = useState<any[]>([]);
  const chartScrollRef = useRef<HTMLDivElement>(null);

  // Operational audit state (Strictly Read-Only with fallbacks)
  const activeShift = operationalData?.activeShift ?? null;
  const transactions: any[] = Array.isArray(operationalData?.transactions)
    ? operationalData.transactions
    : [];
  const closedShifts: any[] = Array.isArray(operationalData?.closedShifts)
    ? operationalData.closedShifts
    : [];
  const summary = operationalData?.summary ?? {
    incomeToday: 0,
    expenseToday: 0,
    incomeMonth: 0,
    expenseMonth: 0,
    totalDifference: 0,
    discrepancyCount: 0,
    currentExpectedCash: 0,
  };

  const [isVoidingId, setIsVoidingId] = useState<string | null>(null);

  useEffect(() => {
    if (chartScrollRef.current) {
      chartScrollRef.current.scrollLeft = chartScrollRef.current.scrollWidth;
    }
  }, [timeframe, overview]);

  const handleVoid = async (id: string) => {
    const reason = window.prompt('Por favor, ingresa el motivo de la anulación (obligatorio para auditoría):');
    if (reason !== null) {
      if (reason.trim() === '') return alert('El motivo de anulación es obligatorio.');
      setIsVoidingId(id);
      try {
        await voidPayment(id, reason);
      } catch (err) {
        console.error('Error al anular pago:', err);
      } finally {
        setIsVoidingId(null);
      }
    }
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [finRes, recRes] = await Promise.all([
          getFinancialOverview(timeframe).catch(() => ({ success: false, data: null })),
          getRevenueRecoveryData().catch(() => ({ success: false, data: null })),
        ]);
        if (finRes?.success && finRes.data) {
          setOverview(finRes.data);
        } else {
          setOverview(null);
        }
        if (recRes?.success) {
          setRecoveryData(recRes);
        } else {
          setRecoveryData(null);
        }
      } catch (err) {
        console.error('Error loading financial overview:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [timeframe]);

  const loadBreakdown = async (dateStr: string) => {
    if (!dateStr) return;
    try {
      const d = new Date(dateStr);
      const formatted = isNaN(d.getTime())
        ? dateStr
        : dateStr.includes('T')
        ? dateStr.split('T')[0]
        : dateStr;

      setSelectedDate(formatted);
      const res = await getDailyBreakdown(formatted);
      if (res?.success && Array.isArray(res.data)) {
        setBreakdownData(res.data);
      } else {
        setBreakdownData([]);
      }
    } catch {
      setBreakdownData([]);
    }
  };

  const formatMoney = (val: any) => {
    return Number(val || 0).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    });
  };

  const formatDate = (val: any) => {
    if (!val) return '—';
    try {
      const d = new Date(val);
      return isNaN(d.getTime())
        ? '—'
        : d.toLocaleDateString('es-CO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
    } catch {
      return '—';
    }
  };

  const formatTime = (val: any) => {
    if (!val) return '—';
    try {
      const d = new Date(val);
      return isNaN(d.getTime())
        ? '—'
        : d.toLocaleDateString('es-CO', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          });
    } catch {
      return '—';
    }
  };

  const handleWhatsApp = (member: any) => {
    if (!member || !member.phone) return;
    let message = '';
    const cleanPhone = String(member.phone).replace(/\D/g, '');
    const phoneWithCode = cleanPhone.length === 10 ? `57${cleanPhone}` : cleanPhone;
    if (member.status === 'expired') {
      message = `¡Hola ${member.fullName || 'socio'}! Te extrañamos en el gym 💪. Tu membresía ${member.planName || ''} venció el ${member.endDate || ''}. Renuévala hoy para mantener tu acceso sin interrupciones. ¿Deseas hacer transferencia o pasas por caja?`;
    } else {
      message = `¡Hola ${member.fullName || 'socio'}! Te recordamos que tu membresía ${member.planName || ''} vence el ${member.endDate || ''}. Pasa por recepción para renovar con anticipación.`;
    }
    const url = `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Safe calculated financial fields
  const totalRevenue = Number(overview?.totalRevenue ?? overview?.total ?? summary?.incomeMonth ?? 0);
  const percentageChange = Number(overview?.percentageChange ?? 0);
  const cashRevenue = Number(overview?.cashRevenue ?? overview?.byMethod?.cash ?? 0);
  const transferRevenue = Number(overview?.transferRevenue ?? overview?.byMethod?.transfer ?? 0);
  const totalAtRisk = Number(recoveryData?.totalAtRiskRevenue ?? recoveryData?.totalAtRisk ?? 0);

  // Safe trend array
  const trendList: any[] = Array.isArray(overview?.trend)
    ? overview.trend
    : Array.isArray(overview?.chartData)
    ? overview.chartData.map((c: any) => ({
        date: c.date,
        label: c.date
          ? new Date(c.date + 'T12:00:00').toLocaleDateString('es-CO', {
              day: '2-digit',
              month: 'short',
            })
          : '',
        revenue: Number(c.total || 0),
      }))
    : [];

  const maxRevenueVal =
    Number(overview?.maxRevenue) ||
    (trendList.length > 0 ? Math.max(...trendList.map((t: any) => Number(t.revenue || 0)), 1000) : 1000);

  // Safe at risk members array
  const rawAtRisk = recoveryData?.atRiskMembers || recoveryData?.data || [];
  const atRiskList: any[] = Array.isArray(rawAtRisk)
    ? rawAtRisk.filter((m: any) => {
        const days = Number(m?.durationDays || m?.planDuration || 0);
        if (recoveryFilter === 'monthly') return days >= 25 && days <= 35;
        if (recoveryFilter === 'yearly') return days >= 350;
        return true;
      })
    : [];

  // Elegant loading skeleton
  if (loading && !overview) {
    return (
      <div className="space-y-6 font-sans animate-pulse">
        {/* Skeleton Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 rounded-md" />
            <div className="h-3.5 w-72 bg-slate-100 rounded-md" />
          </div>
          <div className="h-8 w-60 bg-slate-100 rounded-lg" />
        </div>

        {/* Skeleton Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-3.5 w-24 bg-slate-100 rounded" />
                <div className="h-4 w-12 bg-slate-100 rounded-full" />
              </div>
              <div className="h-8 w-36 bg-slate-200 rounded" />
              <div className="h-3 w-40 bg-slate-100 rounded" />
            </div>
          ))}
        </div>

        {/* Skeleton Audit KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-50/75 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-6 w-28 bg-slate-300 rounded" />
              </div>
              <div className="h-8 w-8 bg-slate-200 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Skeleton Audit Tables */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 space-y-4">
          <div className="h-4 w-48 bg-slate-200 rounded" />
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-slate-50 rounded-lg border border-slate-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* PAGE HEADER & TIMEFRAME SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Auditoría Financiera</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              Solo Lectura
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Control de facturación, conciliación de arqueos de caja y auditoría del libro mayor
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg w-fit">
          {(['today', 'week', 'month', 'year'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`py-1.5 px-3 text-xs font-semibold rounded-md transition-all ${
                timeframe === tf
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tf === 'today'
                ? 'Hoy'
                : tf === 'week'
                ? 'Semana'
                : tf === 'month'
                ? 'Este Mes'
                : 'Este Año'}
            </button>
          ))}
        </div>
      </div>

      {/* COMPACT KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Facturación Período</span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                percentageChange >= 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                  : 'bg-rose-50 text-rose-700 border-rose-200/60'
              }`}
            >
              {percentageChange > 0 ? '+' : ''}
              {percentageChange.toFixed(1)}% vs anterior
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {formatMoney(totalRevenue)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Total recaudado en el período</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Medios de Pago</span>
            <span className="text-xs text-slate-400">Desglose</span>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Efectivo:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {formatMoney(cashRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Transferencia:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {formatMoney(transferRevenue)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Cartera en Riesgo</span>
            <span className="bg-amber-50 text-amber-700 border border-amber-200/60 text-xs font-medium px-2 py-0.5 rounded-full">
              Por renovar
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {formatMoney(totalAtRisk)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Membresías próximas a expirar o en mora</p>
          </div>
        </div>
      </div>

      {/* AUDIT SUMMARY METRICS: Ingresos Mes, Descuadres Totales, Gastos Mes, Estado Turno */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ingresos Mes */}
        <div className="bg-slate-50/75 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Ingresos del Mes
            </p>
            <p className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
              {formatMoney(summary?.incomeMonth ?? totalRevenue)}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-100/80 text-emerald-800">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>

        {/* Gastos Operativos Mes */}
        <div className="bg-slate-50/75 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Gastos del Mes
            </p>
            <p className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
              {formatMoney(summary?.expenseMonth ?? 0)}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-rose-100/80 text-rose-800">
            <TrendingDown className="h-4 w-4" />
          </div>
        </div>

        {/* Descuadres Totales de Caja */}
        <div className="bg-slate-50/75 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Descuadres en Caja
            </p>
            <p
              className={`text-lg font-bold tabular-nums mt-0.5 ${
                (summary?.totalDifference ?? 0) < 0
                  ? 'text-rose-600'
                  : (summary?.totalDifference ?? 0) > 0
                  ? 'text-blue-600'
                  : 'text-emerald-600'
              }`}
            >
              {formatMoney(summary?.totalDifference ?? 0)}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {(summary?.discrepancyCount ?? 0) > 0
                ? `${summary.discrepancyCount} turno(s) con descuadre`
                : 'Arqueos 100% cuadrados'}
            </p>
          </div>
          <div
            className={`p-2 rounded-lg ${
              (summary?.discrepancyCount ?? 0) > 0
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {(summary?.discrepancyCount ?? 0) > 0 ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <Scale className="h-4 w-4" />
            )}
          </div>
        </div>

        {/* Estado Turno Mostrador (Solo Lectura) */}
        <div className="bg-slate-50/75 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Caja Mostrador Actual
            </p>
            <p className="text-sm font-bold text-slate-900 mt-0.5 truncate max-w-[150px]">
              {activeShift ? `Abierto (${activeShift.userName || 'Cajero'})` : 'Caja Cerrada'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 tabular-nums">
              {activeShift
                ? `Esperado: ${formatMoney(summary?.currentExpectedCash ?? 0)}`
                : 'Sin turno activo'}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-slate-200 text-slate-700">
            <Clock className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* CHARTS & RECOVERY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRÁFICO DE BARRAS INTERACTIVO */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Tendencia de Ingresos Diarios
              </h2>
              <p className="text-[11px] text-slate-400">
                Haz clic en una barra para ver el desglose detallado de pagos
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-900" />
              <span>Cobros</span>
            </div>
          </div>

          {/* Scroll Container */}
          <div
            ref={chartScrollRef}
            className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-4 pb-2"
          >
            {trendList.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                No hay movimientos registrados en este período para graficar.
              </div>
            ) : (
              <div className="min-w-[600px] flex flex-col justify-end">
                {/* Gráfico y Eje Y */}
                <div className="relative flex">
                  {/* Eje Y Labels */}
                  <div className="w-12 h-44 flex flex-col justify-between items-end pr-2 text-[10px] text-slate-400 select-none pb-4">
                    <span>{formatMoney(maxRevenueVal)}</span>
                    <span>{formatMoney(maxRevenueVal / 2)}</span>
                    <span>$0</span>
                  </div>

                  {/* Barras */}
                  <div className="flex-1 flex items-end justify-between gap-1.5 h-44 border-b border-slate-100 pb-2 relative">
                    {(trendList || []).map((t: any) => {
                      const heightPct = maxRevenueVal
                        ? (Number(t.revenue || 0) / maxRevenueVal) * 100
                        : 0;
                      const hasRevenue = Number(t.revenue || 0) > 0;
                      const isSelected = selectedDate === t.date;

                      return (
                        <div
                          key={t.date}
                          onClick={() => loadBreakdown(t.date)}
                          className="flex-1 flex flex-col items-center group cursor-pointer h-full justify-end"
                        >
                          {/* Tooltip on Hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-1 bg-slate-900 text-white text-[10px] rounded-md pointer-events-none whitespace-nowrap z-10 font-mono shadow-xs">
                            {t.label}: {formatMoney(t.revenue)}
                          </div>

                          {/* Barra */}
                          <div
                            style={{ height: `${Math.max(heightPct, 2)}%` }}
                            className={`w-full max-w-[28px] rounded-t-sm transition-all duration-200 ${
                              isSelected
                                ? 'bg-blue-600 shadow-sm'
                                : hasRevenue
                                ? 'bg-slate-900 group-hover:bg-slate-700'
                                : 'bg-slate-100 group-hover:bg-slate-200'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Eje X Labels */}
                <div className="flex ml-12 gap-1.5 pt-2 text-[10px] text-slate-400 select-none">
                  {(trendList || []).map((t: any) => (
                    <div key={t.date} className="flex-1 text-center truncate">
                      {t.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* GESTIÓN DE COBRANZA PREVENTIVA */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Gestión de Cobranza
              </h2>
              <div className="flex gap-1 text-[11px]">
                <button
                  onClick={() => setRecoveryFilter('all')}
                  className={`px-2 py-0.5 rounded-md font-medium transition ${
                    recoveryFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setRecoveryFilter('monthly')}
                  className={`px-2 py-0.5 rounded-md font-medium transition ${
                    recoveryFilter === 'monthly'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Mes
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {atRiskList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No hay socios pendientes de cobro preventivo.
                </div>
              ) : (
                (atRiskList || []).slice(0, 5).map((m: any) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {m.fullName || 'Socio'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {m.planName || 'Plan'} · Vence: {formatDate(m.endDate)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleWhatsApp(m)}
                      className="shrink-0 p-1.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                      title="Contactar vía WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE AUDITORÍA: HISTORIAL DE TURNOS CERRADOS Y TRANSACCIONES A ANCHO COMPLETO */}
      <div className="space-y-6 pt-2">
        {/* TABLA: HISTORIAL DE TURNOS CERRADOS (ARQUEOS) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/75">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Scale className="h-4 w-4 text-slate-700" />
                Historial de Turnos Cerrados (Auditoría de Arqueos)
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Trazabilidad de arqueos ciegos, bases iniciales y detección de descuadres por cajero
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {closedShifts?.length || 0} turnos auditados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Cajero / Usuario</th>
                  <th className="py-3 px-4">Apertura - Cierre</th>
                  <th className="py-3 px-4">Base Inicial</th>
                  <th className="py-3 px-4">Esperado Sistema</th>
                  <th className="py-3 px-4">Contado Físico</th>
                  <th className="py-3 px-4">Diferencia (Descuadre)</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {(closedShifts || []).map((shift: any) => {
                  const diff = Number(shift?.difference || 0);
                  const isCuadrado = diff === 0;
                  const isFaltante = diff < 0;

                  return (
                    <tr key={shift.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-950">
                        {shift.userName || 'Personal de Recepción'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 tabular-nums">
                        <div>
                          <span>Inició: </span>
                          {formatTime(shift.openingTime)}
                        </div>
                        {shift.closingTime && (
                          <div className="text-[11px] text-slate-400">
                            <span>Cerró: </span>
                            {formatTime(shift.closingTime)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700 tabular-nums">
                        {formatMoney(Number(shift.initialCash || 0))}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 tabular-nums">
                        {formatMoney(Number(shift.finalCashExpected || 0))}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-950 tabular-nums">
                        {formatMoney(Number(shift.finalCashCounted || 0))}
                      </td>
                      <td className="py-3 px-4 tabular-nums">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full border ${
                            isCuadrado
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isFaltante
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {isCuadrado
                            ? '$0 (Cuadrado)'
                            : isFaltante
                            ? `${formatMoney(diff)} (Faltante)`
                            : `+${formatMoney(diff)} (Sobrante)`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-200">
                          Auditado
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {(!closedShifts || closedShifts.length === 0) && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No hay turnos cerrados aún para auditar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TABLA: LIBRO MAYOR DE TRANSACCIONES OPERATIVAS (A TODO EL ANCHO) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-slate-50/75">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Receipt className="h-4 w-4 text-slate-700" />
                Libro Mayor de Transacciones Operativas
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Registro cronológico completo de ingresos de membresías, pases exprés y gastos de caja
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {transactions?.length || 0} movimientos registrados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Fecha / Hora</th>
                  <th className="py-3 px-4">Concepto / Socio</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Medio de Pago</th>
                  <th className="py-3 px-4">Monto</th>
                  <th className="py-3 px-4">Estado Contable</th>
                  <th className="py-3 px-4 text-right">Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {(transactions || []).map((tx: any, idx: number) => (
                  <tr key={tx.id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 tabular-nums">
                      {formatDate(tx.date)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {tx.description || 'Sin concepto'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          tx.type === 'income'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {tx.type === 'income' ? 'Ingreso' : 'Egreso'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {tx.method === 'cash' ? 'Efectivo' : 'Transferencia'}
                    </td>
                    <td
                      className={`py-3.5 px-4 font-bold tabular-nums text-sm ${
                        tx.status === 'voided'
                          ? 'text-slate-400 line-through'
                          : tx.type === 'income'
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatMoney(tx.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      {tx.status === 'paid' ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Pagado
                        </span>
                      ) : (
                        <span
                          className="bg-slate-100 text-slate-600 border border-slate-200/60 text-[11px] font-medium px-2 py-0.5 rounded-full cursor-help"
                          title={`Motivo de anulación: ${tx.voidReason || 'No especificado'}`}
                        >
                          Anulado
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {tx.type === 'income' && tx.status === 'paid' && (
                        <button
                          disabled={isVoidingId === tx.id}
                          onClick={() => handleVoid(tx.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition disabled:opacity-50 inline-flex items-center gap-1"
                          title="Anular pago con motivo auditado"
                        >
                          <Ban className="h-4 w-4" />
                          <span className="text-[11px] font-medium hidden sm:inline">Anular</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {(!transactions || transactions.length === 0) && (
                  <tr>
                    <td colSpan={7} className="py-12 px-4 text-center">
                      <div className="max-w-md mx-auto flex flex-col items-center justify-center">
                        <div className="h-10 w-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center mb-3 border border-slate-200/80">
                          <Receipt className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">
                          Sin movimientos de caja registrados
                        </h3>
                        <p className="text-xs text-slate-500 max-w-sm">
                          Los cobros de membresías, ventas y gastos se reflejarán aquí en tiempo real en modo auditoría.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: Desglose del Día */}
      {selectedDate && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 max-w-2xl w-full relative max-h-[90dvh] flex flex-col animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Desglose Diario de Facturación</h2>
                <p className="text-xs text-slate-500 capitalize">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CO', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex justify-between items-center mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-xs font-medium text-slate-600">Total Recaudado:</span>
              <span className="text-sm font-bold text-slate-900 tabular-nums">
                {formatMoney(
                  (breakdownData || []).reduce((acc, curr) => acc + Number(curr?.amount || 0), 0)
                )}
              </span>
            </div>

            <div className="overflow-y-auto flex-1 border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/75 border-b border-slate-100 sticky top-0 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Hora</th>
                    <th className="py-2.5 px-3">Concepto</th>
                    <th className="py-2.5 px-3">Socio / Detalle</th>
                    <th className="py-2.5 px-3">Método</th>
                    <th className="py-2.5 px-3 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(breakdownData || []).map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap tabular-nums">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString('es-CO', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 capitalize">
                        {(tx.concept || 'pago').replace('_', ' ')}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {tx.memberFullName || 'Mostrador'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {tx.method === 'cash' ? 'Efectivo' : 'Transf.'}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-right text-emerald-600 tabular-nums">
                        +{formatMoney(Number(tx.amount || 0))}
                      </td>
                    </tr>
                  ))}
                  {(!breakdownData || breakdownData.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No hay transacciones registradas en este día.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
