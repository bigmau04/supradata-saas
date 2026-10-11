'use client';

import { useState, useEffect, useRef } from 'react';
import { getFinancialOverview, getRevenueRecoveryData, getDailyBreakdown } from '@/app/actions/finances';
import { createPayment, voidPayment, createExpense, openCashShift, closeCashShift } from '@/app/actions/finance';
import {
  DollarSign,
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Clock,
  Ban,
  PlusCircle,
  ShieldCheck,
  Receipt,
  BarChart3,
  ArrowRight,
  Plus,
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

  useEffect(() => {
    if (chartScrollRef.current) {
      chartScrollRef.current.scrollLeft = chartScrollRef.current.scrollWidth;
    }
  }, [timeframe, overview]);

  // Operational state
  const { activeShift, transactions, members, summary } = operationalData || {};
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [isVoidingId, setIsVoidingId] = useState<string | null>(null);

  const handleVoid = async (id: string) => {
    const reason = window.prompt('Por favor, ingresa el motivo de la anulación (obligatorio):');
    if (reason !== null) {
      if (reason.trim() === '') return alert('El motivo es obligatorio.');
      setIsVoidingId(id);
      await voidPayment(id, reason);
      setIsVoidingId(null);
    }
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [finRes, recRes] = await Promise.all([
        getFinancialOverview(timeframe),
        getRevenueRecoveryData(),
      ]);
      if (finRes.success) setOverview(finRes.data);
      if (recRes.success) setRecoveryData(recRes);
      setLoading(false);
    }
    load();
  }, [timeframe]);

  const loadBreakdown = async (dateStr: string) => {
    const d = new Date(dateStr);
    d.setHours(12);
    const formatted = d.toISOString().split('T')[0];

    setSelectedDate(formatted);
    const res = await getDailyBreakdown(`'${formatted}'`);
    if (res.success) {
      setBreakdownData(res.data || []);
    }
  };

  const formatMoney = (val: number) => {
    return Number(val || 0).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    });
  };

  const handleWhatsApp = (member: any) => {
    let message = '';
    if (member.status === 'expired') {
      message = `¡Hola ${member.fullName}! Te extrañamos en el gym 💪. Tu membresía ${member.planName} venció el ${member.endDate}. Renuévala hoy para mantener tu acceso sin interrupciones. ¿Deseas hacer transferencia o pasas por caja?`;
    } else {
      message = `¡Hola ${member.fullName}! Te recordamos que tu membresía ${member.planName} vence el ${member.endDate}. Pasa por recepción para renovar con anticipación.`;
    }
    const url = `https://wa.me/57${member.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 text-xs font-medium animate-pulse">
        Cargando analítica financiera...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* PAGE HEADER & TIMEFRAME SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Analítica Financiera</h1>
          <p className="text-xs text-slate-500">
            Facturación consolidada, desglose por medios de pago y cobranza preventiva
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

      {overview && (
        <>
          {/* COMPACT KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Facturación Total</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                    overview.percentageChange >= 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                      : 'bg-rose-50 text-rose-700 border-rose-200/60'
                  }`}
                >
                  {overview.percentageChange > 0 ? '+' : ''}
                  {overview.percentageChange.toFixed(1)}% vs anterior
                </span>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                  {formatMoney(overview.total)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Total recaudado en el período</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Medios de Pago</span>
                <span className="p-1 rounded-md bg-slate-100 text-slate-700">
                  <CreditCard className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">💵 Efectivo:</span>
                  <span className="font-bold tabular-nums text-slate-900">
                    {formatMoney(overview.byMethod.cash)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">🏦 Transferencia:</span>
                  <span className="font-bold tabular-nums text-slate-900">
                    {formatMoney(overview.byMethod.transfer)}
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
                  {formatMoney(recoveryData?.totalAtRisk || 0)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Membresías próximas a expirar o en mora
                </p>
              </div>
            </div>
          </div>

          {/* CHART & REVENUE RECOVERY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfica de Tendencia de Ingresos */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-slate-700" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Tendencia de Ingresos Diarios
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  Haz clic en una barra para ver desglose
                </span>
              </div>

              {overview.chartData.length > 0 || timeframe === 'month' ? (
                <div className="relative w-full overflow-hidden bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {(() => {
                    let filled: any[] = [];
                    const now = new Date();

                    if (timeframe === 'year') {
                      const months = [
                        'Ene',
                        'Feb',
                        'Mar',
                        'Abr',
                        'May',
                        'Jun',
                        'Jul',
                        'Ago',
                        'Sep',
                        'Oct',
                        'Nov',
                        'Dic',
                      ];
                      filled = months.map((m, i) => ({
                        date: m,
                        total: 0,
                        isMonth: true,
                        monthIdx: i,
                      }));

                      overview.chartData.forEach((d: any) => {
                        const mIdx = new Date(d.date + 'T12:00:00').getMonth();
                        filled[mIdx].total += Number(d.total) || 0;
                      });
                    } else {
                      let start, end;
                      if (timeframe === 'month') {
                        start = new Date(now.getFullYear(), now.getMonth(), 1);
                        end = new Date(now);
                      } else {
                        start =
                          overview.chartData.length > 0
                            ? new Date(overview.chartData[0].date + 'T12:00:00')
                            : new Date();
                        end =
                          overview.chartData.length > 0
                            ? new Date(
                                overview.chartData[overview.chartData.length - 1].date +
                                  'T12:00:00'
                              )
                            : new Date();
                      }

                      const map = new Map(overview.chartData.map((d: any) => [d.date, d.total]));
                      for (let c = new Date(start); c <= end; c.setDate(c.getDate() + 1)) {
                        const dStr = c.toISOString().split('T')[0];
                        filled.push({
                          date: dStr,
                          total: map.get(dStr) || 0,
                          dateObj: new Date(c),
                          isMonth: false,
                        });
                      }
                    }

                    const max =
                      filled.length > 0
                        ? Math.max(...filled.map((x) => Number(x.total) || 0))
                        : 0;
                    const maxDisplay = max === 0 ? 100 : max;

                    const formatY = (val: number) => {
                      if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
                      if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
                      return `$${val}`;
                    };

                    const formatDateShort = (d: Date) => {
                      return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
                    };

                    const scrollContainerClass =
                      timeframe === 'year'
                        ? 'flex-1 overflow-hidden pb-2'
                        : 'flex-1 overflow-x-auto overflow-y-hidden pb-2 [scrollbar-width:thin]';

                    const innerContainerClass =
                      timeframe === 'year'
                        ? 'w-full grid grid-cols-12 gap-1 items-end h-44 px-2 border-b border-dashed border-slate-200'
                        : 'flex items-end gap-2.5 h-44 min-w-max px-2 border-b border-dashed border-slate-200';

                    return (
                      <div className="flex w-full items-end">
                        <div className="w-12 flex flex-col justify-between h-44 py-2 text-[10px] font-mono text-slate-400 select-none border-r border-slate-200 bg-transparent pr-1">
                          <span>{formatY(maxDisplay)}</span>
                          <span>{formatY(maxDisplay / 2)}</span>
                          <span>$0</span>
                        </div>

                        <div ref={chartScrollRef} className={scrollContainerClass}>
                          <div className={innerContainerClass}>
                            {filled.map((d: any) => {
                              const totalVal = Number(d.total) || 0;
                              const height = maxDisplay > 0 ? (totalVal / maxDisplay) * 100 : 0;
                              const label = d.isMonth ? d.date : formatDateShort(d.dateObj);

                              return (
                                <div
                                  key={d.date}
                                  className={`${
                                    timeframe === 'year' ? 'w-full' : 'w-8'
                                  } flex flex-col items-center gap-1.5 group relative h-full justify-end cursor-pointer`}
                                  onClick={() => !d.isMonth && loadBreakdown(d.date)}
                                >
                                  {totalVal > 0 ? (
                                    <div
                                      className="w-5 max-w-full bg-slate-900 hover:bg-slate-700 rounded-t-md transition-all duration-150 relative"
                                      style={{ height: `${height}%`, minHeight: '4px' }}
                                    >
                                      <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-30 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] font-semibold py-1 px-2 rounded-md shadow-lg whitespace-nowrap pointer-events-none">
                                        <span>{formatMoney(totalVal)}</span>
                                        <span className="text-[9px] text-slate-300 font-normal">
                                          {label}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-5 h-1 bg-slate-200/80 rounded-t-sm" />
                                  )}
                                  <span className="text-[9px] text-slate-400 select-none">
                                    {label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="h-44 flex items-center justify-center text-xs text-slate-400">
                  Sin registros suficientes en este período
                </div>
              )}
            </div>

            {/* Cartera y Recuperación de Socios */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Gestión de Cobranza
                  </h3>
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
                  {(() => {
                    const list = (recoveryData?.atRiskMembers || []).filter((m: any) => {
                      if (recoveryFilter === 'monthly')
                        return m.planDuration >= 25 && m.planDuration <= 35;
                      if (recoveryFilter === 'yearly') return m.planDuration >= 350;
                      return true;
                    });

                    if (list.length === 0) {
                      return (
                        <div className="py-8 text-center text-xs text-slate-400">
                          No hay socios pendientes de cobro preventivo.
                        </div>
                      );
                    }

                    return list.slice(0, 5).map((m: any) => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">{m.fullName}</p>
                          <p className="text-[11px] text-slate-400">
                            {m.planName} · Vence: {m.endDate}
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
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* SECCIÓN OPERATIVA (Turno de caja y Transacciones) */}
      {operationalData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Formularios Operativos */}
          <div className="lg:col-span-1 space-y-4">
            {/* Turno de Caja */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Turno de Caja
              </h2>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 mb-3 text-xs">
                <span className="text-slate-500 font-medium">Efectivo en Caja (Esperado):</span>
                <p className="text-xl font-bold tabular-nums text-slate-900 mt-0.5">
                  {activeShift ? formatMoney(summary?.currentExpectedCash) : 'Caja Cerrada'}
                </p>
              </div>

              {activeShift ? (
                <form action={closeCashShift} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Efectivo Físico Contado ($)
                    </label>
                    <input
                      name="finalCashCounted"
                      type="number"
                      required
                      placeholder="150000"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none tabular-nums font-semibold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold py-2 px-4 rounded-lg transition shadow-2xs"
                  >
                    Cerrar Turno (Arqueo)
                  </button>
                </form>
              ) : (
                <form action={openCashShift} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Base Inicial en Efectivo ($)
                    </label>
                    <input
                      name="initialCash"
                      type="number"
                      required
                      defaultValue="50000"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none tabular-nums font-semibold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold py-2 px-4 rounded-lg transition shadow-2xs"
                  >
                    Abrir Turno de Caja
                  </button>
                </form>
              )}
            </div>

            {/* Registrar Recaudo Manual */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                <PlusCircle className="h-3.5 w-3.5 text-emerald-600" /> Nuevo Recaudo
              </h2>
              <form
                action={async (formData) => {
                  setIsSubmittingPayment(true);
                  await createPayment(formData);
                  setIsSubmittingPayment(false);
                }}
                className="space-y-2.5"
              >
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Socio *</label>
                  <select
                    name="memberId"
                    required
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none bg-white font-medium"
                  >
                    <option value="">Selecciona un socio...</option>
                    {members?.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.document})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Monto ($) *</label>
                    <input
                      name="amount"
                      type="number"
                      required
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none tabular-nums font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Método *</label>
                    <select
                      name="method"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none bg-white font-medium"
                    >
                      <option value="cash">Efectivo</option>
                      <option value="transfer">Transf./Tarjeta</option>
                    </select>
                  </div>
                </div>
                <button
                  disabled={isSubmittingPayment}
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-4 rounded-lg transition shadow-2xs disabled:opacity-50 mt-1"
                >
                  {isSubmittingPayment ? 'Procesando...' : 'Registrar Pago'}
                </button>
              </form>
            </div>

            {/* Registrar Gasto Operativo */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                <TrendingDown className="h-3.5 w-3.5 text-rose-600" /> Registrar Gasto
              </h2>
              <form
                action={async (formData) => {
                  setIsSubmittingExpense(true);
                  await createExpense(formData);
                  setIsSubmittingExpense(false);
                }}
                className="space-y-2.5"
              >
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Concepto *</label>
                  <input
                    name="description"
                    required
                    placeholder="Ej. Limpieza o reparaciones"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Monto ($) *</label>
                  <input
                    name="amount"
                    type="number"
                    required
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none tabular-nums font-semibold"
                  />
                </div>
                <button
                  disabled={isSubmittingExpense}
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition shadow-2xs disabled:opacity-50 mt-1"
                >
                  {isSubmittingExpense ? 'Procesando...' : 'Registrar Salida'}
                </button>
              </form>
            </div>
          </div>

          {/* Historial de Transacciones */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/75">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Transacciones Operativas
                </h2>
                <span className="text-xs text-slate-500">
                  {transactions?.length || 0} movimientos
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left">
                  <thead className="bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Fecha / Hora</th>
                      <th className="py-3 px-4">Detalle</th>
                      <th className="py-3 px-4">Monto</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {transactions?.map((tx: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 text-xs text-slate-500 tabular-nums">
                          {new Date(tx.date).toLocaleString('es-CO', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {tx.description}{' '}
                          <span className="text-[10px] text-slate-400 block uppercase font-normal">
                            {tx.method === 'cash' ? 'Efectivo' : 'Transf.'}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-4 font-bold tabular-nums ${
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
                        <td className="py-3 px-4">
                          {tx.status === 'paid' ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-medium px-2 py-0.5 rounded-full">
                              Pagado
                            </span>
                          ) : (
                            <span
                              className="bg-slate-100 text-slate-600 border border-slate-200/60 text-xs font-medium px-2 py-0.5 rounded-full cursor-help"
                              title={`Motivo: ${tx.voidReason}`}
                            >
                              Anulado
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {tx.type === 'income' && tx.status === 'paid' && (
                            <button
                              disabled={isVoidingId === tx.id}
                              onClick={() => handleVoid(tx.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition disabled:opacity-50"
                              title="Anular pago / Factura"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(!transactions || transactions.length === 0) && (
                      <tr>
                        <td colSpan={5} className="py-12 px-4 text-center">
                          <div className="max-w-md mx-auto flex flex-col items-center justify-center">
                            <div className="h-10 w-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center mb-3 border border-slate-200/80">
                              <Receipt className="h-5 w-5" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-1">
                              Sin movimientos de caja registrados
                            </h3>
                            <p className="text-xs text-slate-500 max-w-sm mb-4">
                              Los cobros de membresías, ventas rápidas y gastos operativos se registrarán aquí en tiempo real.
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
        </div>
      )}

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
                  breakdownData.reduce((acc, curr) => acc + Number(curr.amount), 0)
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
                  {breakdownData.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap tabular-nums">
                        {new Date(tx.createdAt).toLocaleTimeString('es-CO', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 capitalize">
                        {tx.concept.replace('_', ' ')}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {tx.memberFullName || 'Mostrador'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {tx.method === 'cash' ? 'Efectivo' : 'Transf.'}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-right text-emerald-600 tabular-nums">
                        +{formatMoney(Number(tx.amount))}
                      </td>
                    </tr>
                  ))}
                  {breakdownData.length === 0 && (
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
