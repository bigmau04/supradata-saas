'use client';
import { useState } from 'react';
import { createPayment, voidPayment, createExpense, openCashShift, closeCashShift } from '@/app/actions/finance';
import { DollarSign, Wallet, TrendingDown, Clock, Ban, PlusCircle } from 'lucide-react';

export function FinanceClient({ data }: { data: any }) {
  const { activeShift, transactions, members, coaches, summary } = data;
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [isVoidingId, setIsVoidingId] = useState<string | null>(null);
  
  const formatMoney = (val: number | string) => {
    const num = Number(val) || 0;
    return num.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
  };

  const handleVoid = async (id: string) => {
    const reason = prompt("Por favor, ingresa el motivo de la anulación (obligatorio):");
    if (reason !== null) {
      if (reason.trim() === '') return alert("El motivo es obligatorio.");
      setIsVoidingId(id);
      await voidPayment(id, reason);
      setIsVoidingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      
      {/* Resumen Superior */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-100 text-green-600 rounded-xl"><DollarSign size={28} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Recaudos Hoy</p>
            <p className="text-2xl font-bold text-gray-800">{formatMoney(summary.incomeToday)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-red-100 text-red-600 rounded-xl"><TrendingDown size={28} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Gastos Hoy</p>
            <p className="text-2xl font-bold text-gray-800">{formatMoney(summary.expenseToday)}</p>
          </div>
        </div>
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg flex items-center gap-4 text-white relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10"><Wallet size={120} /></div>
          <div className="p-4 bg-white/10 rounded-xl"><Wallet size={28} /></div>
          <div className="z-10">
            <p className="text-sm text-gray-300 font-medium">Caja Actual (Esperado)</p>
            <p className="text-2xl font-bold">{activeShift ? formatMoney(summary.currentExpectedCash) : 'Caja Cerrada'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formularios Operativos */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Turno de Caja */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Clock size={20}/> Turno de Caja</h2>
            {activeShift ? (
              <form action={closeCashShift} className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800 mb-4">
                  Turno abierto desde: {new Date(activeShift.openingTime).toLocaleTimeString('es-CO')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Efectivo Físico Contado</label>
                  <input name="finalCashCounted" type="number" required placeholder="Ej: 150000" className="w-full border p-2 rounded-lg" />
                </div>
                <button type="submit" className="w-full bg-gray-800 text-white font-bold py-2 rounded-lg hover:bg-black transition">Cerrar Caja (Arqueo)</button>
              </form>
            ) : (
              <form action={openCashShift} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base / Efectivo Inicial</label>
                  <input name="initialCash" type="number" required defaultValue="0" className="w-full border p-2 rounded-lg" />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition">Abrir Turno</button>
              </form>
            )}
          </div>

          {/* Registrar Pago */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><PlusCircle size={20}/> Nuevo Recaudo</h2>
            <form action={async (formData) => { setIsSubmittingPayment(true); await createPayment(formData); setIsSubmittingPayment(false); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Miembro</label>
                <select name="memberId" required className="w-full border p-2 rounded-lg">
                  <option value="">Seleccione...</option>
                  {members.map((m: any) => <option key={m.id} value={m.id}>{m.name} ({m.document})</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                  <input name="amount" type="number" required className="w-full border p-2 rounded-lg" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Método</label>
                  <select name="method" className="w-full border p-2 rounded-lg">
                    <option value="cash">Efectivo</option>
                    <option value="transfer">Transf/Tarjeta</option>
                  </select>
                </div>
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Entrenador (Opcional)</label>
                 <select name="coachId" className="w-full border p-2 rounded-lg">
                    <option value="">Sin entrenador asignado</option>
                    {coaches?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
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
                <input name="description" required placeholder="Ej: Pago arriendo" className="w-full border p-2 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto (Sale de caja)</label>
                <input name="amount" type="number" required className="w-full border p-2 rounded-lg" />
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
             <div className="p-6 border-b">
               <h2 className="text-xl font-bold text-gray-800">Transacciones Recientes</h2>
             </div>
             <table className="w-full text-left">
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
                 {transactions.map((tx: any, idx: number) => (
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
                 {transactions.length === 0 && (
                   <tr>
                     <td colSpan={5} className="text-center py-8 text-gray-500">No hay movimientos recientes</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
}
