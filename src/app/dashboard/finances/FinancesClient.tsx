'use client';
import { useState, useEffect, useRef } from 'react';
import { getFinancialOverview, getRevenueRecoveryData, getDailyBreakdown } from '@/app/actions/finances';
import { createPayment, voidPayment, createExpense, openCashShift, closeCashShift } from '@/app/actions/finance';
import { DollarSign, Wallet, CreditCard, TrendingUp, TrendingDown, MessageCircle, Clock, Ban, PlusCircle } from 'lucide-react';

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

  // Estado operativo
  const { activeShift, transactions, members, coaches, summary } = operationalData || {};
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [isVoidingId, setIsVoidingId] = useState<string | null>(null);

  const handleVoid = async (id: string) => {
    const reason = window.prompt("Por favor, ingresa el motivo de la anulación (obligatorio):");
    if (reason !== null) {
      if (reason.trim() === '') return alert("El motivo es obligatorio.");
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
        getRevenueRecoveryData()
      ]);
      if (finRes.success) setOverview(finRes.data);
      if (recRes.success) setRecoveryData(recRes);
      setLoading(false);
    }
    load();
  }, [timeframe]);

  const loadBreakdown = async (dateStr: string) => {
    // Add 12 hours to avoid timezone issues when clicking chart
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
    return Number(val || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
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
    return <div className="text-center py-20 text-gray-500 font-bold animate-pulse">Cargando analíticas...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <DollarSign className="text-blue-600" size={32} />
            Analítica Financiera
          </h1>
          <p className="text-gray-500 mt-2">Métricas de facturación, medios de pago y recuperación de cartera.</p>
        </div>
        <div className="flex gap-2 bg-white rounded-xl shadow-sm border border-gray-100 p-1 overflow-x-auto w-full md:w-auto">
          {(['today', 'week', 'month', 'year'] as const).map(tf => (
            <button key={tf} onClick={() => setTimeframe(tf)} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${timeframe === tf ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {tf === 'today' ? 'Hoy' : tf === 'week' ? 'Semana' : tf === 'month' ? 'Este Mes' : 'Este Año'}
            </button>
          ))}
        </div>
      </div>

      {overview && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Facturación Total</p>
              <p className="text-4xl font-black text-gray-800">{formatMoney(overview.total)}</p>
              <div className={`flex items-center gap-1 mt-2 text-sm font-bold ${overview.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {overview.percentageChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{overview.percentageChange > 0 ? '+' : ''}{overview.percentageChange.toFixed(1)}% vs anterior</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-4">Medios de Pago</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-gray-700 font-medium"><Wallet size={16} className="text-green-600"/> Efectivo</div>
                  <span className="font-bold">{formatMoney(overview.byMethod.cash)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-gray-700 font-medium"><CreditCard size={16} className="text-blue-600"/> Transferencia</div>
                  <span className="font-bold">{formatMoney(overview.byMethod.transfer)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 border-l-4 border-l-orange-500">
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Dinero en Riesgo</p>
              <p className="text-4xl font-black text-orange-600">{formatMoney(recoveryData?.totalAtRisk || 0)}</p>
              <p className="text-sm text-gray-500 mt-2">Suscripciones por renovar</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Tendencia de Ingresos</h3>
              {overview.chartData.length > 0 || timeframe === 'month' ? (
                <div className="relative w-full overflow-hidden bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mt-4">
                  {(() => {
                    let filled: any[] = [];
                    const now = new Date();
                    
                    if (timeframe === 'year') {
                      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                      filled = months.map((m, i) => ({ date: m, total: 0, isMonth: true, monthIdx: i }));
                      
                      overview.chartData.forEach((d: any) => {
                        const mIdx = new Date(d.date + 'T12:00:00').getMonth();
                        filled[mIdx].total += (Number(d.total) || 0);
                      });
                    } else {
                      let start, end;
                      if (timeframe === 'month') {
                        start = new Date(now.getFullYear(), now.getMonth(), 1);
                        end = new Date(now);
                      } else {
                        start = overview.chartData.length > 0 ? new Date(overview.chartData[0].date + 'T12:00:00') : new Date();
                        end = overview.chartData.length > 0 ? new Date(overview.chartData[overview.chartData.length - 1].date + 'T12:00:00') : new Date();
                      }

                      const map = new Map(overview.chartData.map((d:any) => [d.date, d.total]));
                      for (let c = new Date(start); c <= end; c.setDate(c.getDate() + 1)) {
                        const dStr = c.toISOString().split('T')[0];
                        filled.push({ date: dStr, total: map.get(dStr) || 0, dateObj: new Date(c), isMonth: false });
                      }
                    }
                    
                    const max = filled.length > 0 ? Math.max(...filled.map(x => Number(x.total) || 0)) : 0;
                    const maxDisplay = max === 0 ? 100 : max; // fallback si no hay datos
                    
                    const formatY = (val: number) => {
                      if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
                      if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
                      return `$${val}`;
                    };

                    const formatDateShort = (d: Date) => {
                      return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
                    };

                    const scrollContainerClass = timeframe === 'year'
                      ? "flex-1 overflow-hidden pb-4"
                      : "flex-1 overflow-x-auto overflow-y-hidden pb-4 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-blue-300 hover:[&::-webkit-scrollbar-thumb]:bg-blue-500 [&::-webkit-scrollbar-thumb]:rounded-full";

                    const innerContainerClass = timeframe === 'year'
                      ? "w-full grid grid-cols-12 gap-1 md:gap-3 items-end h-48 px-2 border-b border-dashed border-slate-200"
                      : "flex items-end gap-3 h-48 min-w-max px-2 border-b border-dashed border-slate-200";

                    return (
                      <div className="flex w-full items-end">
                        {/* Columna Izquierda (Fija) */}
                        <div className="w-14 flex flex-col justify-between h-48 py-2 text-xs font-semibold text-slate-400 select-none border-r border-slate-100 bg-white z-10">
                          <span>{formatY(maxDisplay)}</span>
                          <span>{formatY(maxDisplay/2)}</span>
                          <span>$0</span>
                        </div>

                        {/* Columna Derecha (Scroll) */}
                        <div ref={chartScrollRef} className={scrollContainerClass}>
                          <div className={innerContainerClass}>
                            {filled.map((d: any) => {
                              const totalVal = Number(d.total) || 0;
                              const height = maxDisplay > 0 ? (totalVal / maxDisplay) * 100 : 0;
                              const label = d.isMonth ? d.date : formatDateShort(d.dateObj);
                              
                              return (
                                <div key={d.date} className={`${timeframe === 'year' ? 'w-full' : 'w-10'} flex flex-col items-center gap-2 group relative h-full justify-end`} onClick={() => !d.isMonth && loadBreakdown(d.date)}>
                                  {totalVal > 0 ? (
                                    <div className="w-6 max-w-full bg-gradient-to-t from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-t-lg transition-all duration-200 cursor-pointer relative" style={{ height: `${height}%`, minHeight: '4px' }}>
                                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[11px] font-bold py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none">
                                        <span>{formatMoney(totalVal)}</span>
                                        <span className="text-[9px] text-slate-300 font-normal">{label}</span>
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-6 max-w-full bg-slate-200/60 h-1.5 rounded-full transition-all duration-200 cursor-pointer relative group">
                                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[11px] font-bold py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none">
                                        <span>$0</span>
                                        <span className="text-[9px] text-slate-300 font-normal">{label}</span>
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                      </div>
                                    </div>
                                  )}
                                  <div className="text-[11px] font-medium text-slate-500 whitespace-nowrap -mb-6">
                                    {label}
                                  </div>
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
                <div className="h-64 flex items-center justify-center text-gray-400">No hay datos en este periodo.</div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[400px]">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-800">Recuperación de Cartera</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">Membresías recientes vencidas o por vencer.</p>
              
              <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg text-xs font-medium">
                <button onClick={() => setRecoveryFilter('all')} className={`flex-1 py-1 rounded transition ${recoveryFilter === 'all' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>Todos</button>
                <button onClick={() => setRecoveryFilter('monthly')} className={`flex-1 py-1 rounded transition ${recoveryFilter === 'monthly' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>Mes</button>
                <button onClick={() => setRecoveryFilter('yearly')} className={`flex-1 py-1 rounded transition ${recoveryFilter === 'yearly' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>Trim/Año</button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {(() => {
                  const filtered = recoveryData?.data?.filter((m: any) => {
                    if (recoveryFilter === 'monthly') return m.durationDays > 7 && m.durationDays <= 31;
                    if (recoveryFilter === 'yearly') return m.durationDays > 31;
                    return true; // all
                  }) || [];

                  if (filtered.length === 0) {
                    return <div className="text-center text-gray-500 text-sm mt-10">Todo al día. No hay socios en riesgo.</div>;
                  }

                  return filtered.map((m: any) => (
                    <div key={m.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm text-gray-800">{m.fullName}</p>
                          <p className="text-xs text-gray-500">{m.planName} - {formatMoney(Number(m.planPrice))}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${m.status === 'expired' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {m.status === 'expired' ? 'Vencido' : 'Por Vencer'}
                        </span>
                      </div>
                      <button onClick={() => handleWhatsApp(m)} className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white text-xs font-bold py-2 rounded-lg transition">
                        <MessageCircle size={14} /> Cobro WhatsApp
                      </button>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </>
      )}

      {/* SECCIÓN OPERATIVA (Turno de caja y Transacciones) */}
      {operationalData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 border-t pt-8">
          {/* Formularios Operativos */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Turno de Caja */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Clock size={20}/> Turno de Caja</h2>
              <div className="mb-4">
                <p className="text-sm text-gray-500 font-medium">Caja Actual (Esperado)</p>
                <p className="text-2xl font-bold text-gray-800">{activeShift ? formatMoney(summary?.currentExpectedCash) : 'Caja Cerrada'}</p>
              </div>
              {activeShift ? (
                <form action={closeCashShift} className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800 mb-4">
                    Turno abierto desde: {new Date(activeShift.openingTime).toLocaleTimeString('es-CO')}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Efectivo Físico Contado</label>
                    <input name="finalCashCounted" type="number" required placeholder="Ej: 150000" className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <button type="submit" className="w-full bg-gray-800 text-white font-bold py-2 rounded-lg hover:bg-black transition">Cerrar Caja (Arqueo)</button>
                </form>
              ) : (
                <form action={openCashShift} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base / Efectivo Inicial</label>
                    <input name="initialCash" type="number" required defaultValue="0" className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition">Abrir Turno</button>
                </form>
              )}
            </div>

            {/* Registrar Pago Manual */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 text-green-600"><PlusCircle size={20}/> Nuevo Recaudo</h2>
              <form action={async (formData) => { setIsSubmittingPayment(true); await createPayment(formData); setIsSubmittingPayment(false); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Miembro</label>
                  <select name="memberId" required className="w-full border p-2 rounded-lg outline-none">
                    <option value="">Seleccione...</option>
                    {members?.map((m: any) => <option key={m.id} value={m.id}>{m.name} ({m.document})</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                    <input name="amount" type="number" required className="w-full border p-2 rounded-lg outline-none" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Método</label>
                    <select name="method" className="w-full border p-2 rounded-lg outline-none">
                      <option value="cash">Efectivo</option>
                      <option value="transfer">Transf/Tarjeta</option>
                    </select>
                  </div>
                </div>
                <button disabled={isSubmittingPayment} type="submit" className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50">
                  {isSubmittingPayment ? 'Procesando...' : 'Registrar Pago'}
                </button>
              </form>
            </div>

            {/* Registrar Gasto */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 text-red-600"><TrendingDown size={20}/> Registrar Gasto</h2>
              <form action={async (formData) => { setIsSubmittingExpense(true); await createExpense(formData); setIsSubmittingExpense(false); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <input name="description" required placeholder="Ej: Pago arriendo" className="w-full border p-2 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto (Sale de caja)</label>
                  <input name="amount" type="number" required className="w-full border p-2 rounded-lg outline-none" />
                </div>
                <button disabled={isSubmittingExpense} type="submit" className="w-full bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50">
                  {isSubmittingExpense ? 'Procesando...' : 'Registrar Gasto'}
                </button>
              </form>
            </div>

          </div>

          {/* Historial de Transacciones */}
          <div className="lg:col-span-2">
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-6 border-b flex justify-between items-center">
                 <h2 className="text-xl font-bold text-gray-800">Transacciones Operativas</h2>
                 <p className="text-sm text-gray-500">Historial reciente de la caja</p>
               </div>
               <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left">
                 <thead className="bg-gray-50 border-b">
                   <tr>
                     <th className="px-6 py-4 font-medium text-gray-600">Fecha</th>
                     <th className="px-6 py-4 font-medium text-gray-600">Detalle</th>
                     <th className="px-6 py-4 font-medium text-gray-600">Monto</th>
                     <th className="px-6 py-4 font-medium text-gray-600">Estado</th>
                     <th className="px-6 py-4 font-medium text-gray-600 text-right">Acción</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y">
                   {transactions?.map((tx: any, idx: number) => (
                     <tr key={idx} className="hover:bg-gray-50">
                       <td className="px-6 py-4 text-gray-500 text-sm">{new Date(tx.date).toLocaleString('es-CO')}</td>
                       <td className="px-6 py-4 font-medium text-gray-800">{tx.description} <span className="text-xs text-gray-400 block uppercase">{tx.method}</span></td>
                       <td className={`px-6 py-4 font-bold ${tx.status === 'voided' ? 'text-gray-400 line-through' : tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount)}
                       </td>
                       <td className="px-6 py-4">
                         {tx.status === 'paid' ? (
                           <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">Pagado</span>
                         ) : (
                           <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold cursor-help" title={`Motivo: ${tx.voidReason}`}>Anulado</span>
                         )}
                       </td>
                       <td className="px-6 py-4 text-right">
                          {tx.type === 'income' && tx.status === 'paid' && (
                            <button disabled={isVoidingId === tx.id} onClick={() => handleVoid(tx.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition disabled:opacity-50" title="Anular Factura">
                              <Ban size={18} />
                            </button>
                          )}
                       </td>
                     </tr>
                   ))}
                   {(!transactions || transactions.length === 0) && (
                     <tr>
                       <td colSpan={5} className="text-center py-8 text-gray-500">No hay movimientos recientes</td>
                     </tr>
                   )}
                 </tbody>
               </table></div>
             </div>
          </div>
        </div>
      )}

      {selectedDate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full relative max-h-[90dvh] flex flex-col">
            <button onClick={() => setSelectedDate(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 font-bold p-2 bg-gray-100 rounded-full text-sm">Cerrar</button>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Desglose del Día</h2>
            <p className="text-gray-500 mb-6 font-medium">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <div className="overflow-y-auto flex-1 border rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-600">Hora</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Concepto</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Socio / Detalle</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Método</th>
                    <th className="px-4 py-3 font-medium text-gray-600 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {breakdownData.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(tx.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute:'2-digit'})}</td>
                      <td className="px-4 py-3 font-medium text-gray-800 capitalize">{tx.concept.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-gray-600">{tx.memberFullName || 'Mostrador'}</td>
                      <td className="px-4 py-3 text-gray-500">{tx.method === 'cash' ? 'Efectivo' : 'Transf.'}</td>
                      <td className="px-4 py-3 font-bold text-right text-green-600">+{formatMoney(Number(tx.amount))}</td>
                    </tr>
                  ))}
                  {breakdownData.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">No hay transacciones exitosas este día.</td>
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
