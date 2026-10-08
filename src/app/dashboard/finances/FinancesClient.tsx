'use client';
import { useState, useEffect } from 'react';
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
    const url = `https://wa.me/57${member.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${member.fullName}, notamos que tu plan ${member.planName} ${member.status === 'expired' ? 'ha vencido' : 'está próximo a vencer'}. ¡Te esperamos en el gimnasio para renovarlo!`)}`;
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
                <div className="h-72 w-full pt-6 pb-8 px-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col justify-end relative mt-4 ml-6 sm:ml-8 w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)]">
                  {(() => {
                    let start, end;
                    const now = new Date();
                    
                    if (timeframe === 'month') {
                      start = new Date(now.getFullYear(), now.getMonth(), 1);
                      end = new Date(now);
                    } else {
                      start = overview.chartData.length > 0 ? new Date(overview.chartData[0].date + 'T12:00:00') : new Date();
                      end = overview.chartData.length > 0 ? new Date(overview.chartData[overview.chartData.length - 1].date + 'T12:00:00') : new Date();
                    }

                    const map = new Map(overview.chartData.map((d:any) => [d.date, d.total]));
                    const filled = [];
                    for (let c = new Date(start); c <= end; c.setDate(c.getDate() + 1)) {
                      const dStr = c.toISOString().split('T')[0];
                      filled.push({ date: dStr, total: map.get(dStr) || 0, dateObj: new Date(c) });
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

                    return (
                      <>
                        <div className="absolute inset-0 pt-6 pb-8 px-4 flex flex-col justify-between pointer-events-none z-0">
                          {[maxDisplay, maxDisplay/2, 0].map((val, i) => (
                            <div key={i} className="w-full flex items-center border-b border-dashed border-slate-200 relative h-0">
                              <span className="absolute -left-3 -translate-x-full text-[10px] text-slate-400 font-medium">
                                {formatY(val)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="w-full h-full flex items-end justify-between gap-1 sm:gap-2 z-10 overflow-x-auto overflow-y-visible">
                          {filled.map((d: any) => {
                            const totalVal = Number(d.total) || 0;
                            const height = maxDisplay > 0 ? (totalVal / maxDisplay) * 100 : 0;
                            
                            return (
                              <div key={d.date} className="flex-1 min-w-[16px] flex flex-col items-center group relative cursor-pointer h-full justify-end" onClick={() => loadBreakdown(d.date)}>
                                {totalVal > 0 ? (
                                  <div className="w-full max-w-[2rem] bg-blue-600 hover:bg-blue-700 rounded-t-lg transition-all mx-auto relative group" style={{ height: `${height}%`, minHeight: '4px' }}>
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap z-20 transition-all transform scale-95 group-hover:scale-100 pointer-events-none flex flex-col items-center">
                                      <span className="font-bold">{formatMoney(totalVal)}</span>
                                      <span className="text-[10px] text-slate-300">{formatDateShort(d.dateObj)}</span>
                                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-full max-w-[2rem] bg-slate-200/60 h-1.5 rounded-full transition-all mx-auto relative group">
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap z-20 transition-all transform scale-95 group-hover:scale-100 pointer-events-none flex flex-col items-center">
                                      <span className="font-bold">$0</span>
                                      <span className="text-[10px] text-slate-300">{formatDateShort(d.dateObj)}</span>
                                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                    </div>
                                  </div>
                                )}
                                <div className="absolute -bottom-6 text-[10px] font-medium text-slate-500 mt-2 truncate w-full text-center">
                                  {filled.length > 15 ? (d.dateObj.getDate() % 5 === 0 || d.dateObj.getDate() === 1 || d.dateObj.getDate() === end.getDate() ? formatDateShort(d.dateObj) : '') : formatDateShort(d.dateObj)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
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
