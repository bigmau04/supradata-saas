'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { registerAttendance, AttendanceResult } from '@/app/actions/attendance';
import { registerQuickPass } from '@/app/actions/quickPass';
import { sellProduct } from '@/app/actions/products';
import { openShift, closeShift, registerMinorExpense } from '@/app/actions/cash_shifts';
import { User, QrCode, Keyboard, DollarSign, X, ShoppingCart, Lock, Unlock, MinusCircle, Wallet } from 'lucide-react';

export function ReceptionClient({ coaches = [], products = [], activeShift = null, userRole = 'receptionist' }: { coaches?: any[], products?: any[], activeShift?: any, userRole?: string }) {
  const [inputValue, setInputValue] = useState('');
  const [scanResult, setScanResult] = useState<AttendanceResult | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [showQuickPass, setShowQuickPass] = useState(false);
  const [showStore, setShowStore] = useState(false);
  
  const [showOpenShift, setShowOpenShift] = useState(!activeShift && userRole !== 'owner');
  const [showCloseShift, setShowCloseShift] = useState(false);
  const [showExpense, setShowExpense] = useState(false);

  const [isSubmittingQuickPass, setIsSubmittingQuickPass] = useState(false);
  const [isSubmittingStore, setIsSubmittingStore] = useState(false);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!scannerOpen && !scanResult && !showQuickPass && !showStore && !showOpenShift && !showCloseShift && !showExpense) {
      inputRef.current?.focus();
    }
  }, [scannerOpen, scanResult, showQuickPass, showStore, showOpenShift, showCloseShift, showExpense]);

  useEffect(() => {
    if (scanResult) {
      const timer = setTimeout(() => {
        setScanResult(null);
        setInputValue('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [scanResult]);

  useEffect(() => {
    if (scannerOpen) {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render(
        async (decodedText) => {
          scanner.clear();
          setScannerOpen(false);
          await handleValidation(decodedText, 'qr_scan');
        },
        () => {}
      );
      return () => { scanner.clear().catch(console.error); };
    }
  }, [scannerOpen]);

  const handleValidation = async (query: string, method: 'qr_scan' | 'manual_doc') => {
    if (!query) return;
    try {
      const res = await registerAttendance(query, method);
      setScanResult(res);
    } catch (e) {
      setScanResult({ success: false, message: 'Error de servidor' });
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleValidation(inputValue, 'manual_doc');
    }
  };

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto font-sans gap-6">
      
      {/* SHIFT SUMMARY CARD */}
      {activeShift && !scanResult && (
        <div className="w-full flex flex-col gap-4">
          <div className="w-full bg-white rounded-3xl shadow p-4 sm:p-6 border flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
                <Unlock size={16} className="text-green-500" /> Turno Abierto
              </div>
              <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-x-6 gap-y-1 mt-2 text-sm text-gray-600">
                <div>Base: <span className="font-bold">${Number(activeShift.initialCash).toLocaleString('es-CO')}</span></div>
                <div>Recaudos (Efectivo): <span className="font-bold text-green-600">+${activeShift.totalCashIn.toLocaleString('es-CO')}</span></div>
                <div>Gastos: <span className="font-bold text-red-600">-${activeShift.totalExpenses.toLocaleString('es-CO')}</span></div>
              </div>
              <div className="text-lg sm:text-xl font-black text-gray-800 mt-2">
                Efectivo Esperado: ${activeShift.expectedCash.toLocaleString('es-CO')}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:flex">
              <button onClick={() => setShowExpense(true)} className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 sm:px-4 py-3 rounded-xl font-bold hover:bg-red-100 transition">
                <MinusCircle size={18} /> Gasto Menor
              </button>
              <button onClick={() => setShowCloseShift(true)} className="flex items-center justify-center gap-2 bg-gray-900 text-white px-3 sm:px-4 py-3 rounded-xl font-bold hover:bg-gray-800 transition">
                <Lock size={18} /> Cerrar Turno
              </button>
            </div>
          </div>

          {/* MOVIMIENTOS DEL TURNO */}
          <div className="w-full bg-white rounded-3xl shadow-sm border p-4 sm:p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Movimientos del Turno</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 font-medium text-gray-600">Hora</th>
                    <th className="px-4 py-2 font-medium text-gray-600">Detalle</th>
                    <th className="px-4 py-2 font-medium text-gray-600">Método</th>
                    <th className="px-4 py-2 font-medium text-gray-600 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {activeShift.transactions?.map((tx: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(tx.date).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {tx.description}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${tx.method === 'cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {tx.method === 'cash' ? 'Efectivo' : 'Transferencia'}
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-bold text-right whitespace-nowrap ${tx.status === 'voided' ? 'text-gray-400 line-through' : tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toLocaleString('es-CO')}
                        {tx.status === 'voided' && <span className="block text-[10px] text-gray-400 uppercase">Anulado</span>}
                      </td>
                    </tr>
                  ))}
                  {(!activeShift.transactions || activeShift.transactions.length === 0) && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-gray-500">Aún no hay movimientos en este turno.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN OPTIONAL SHIFT OPENING */}
      {!activeShift && userRole === 'owner' && (
        <div className="w-full flex justify-end">
           <button onClick={() => setShowOpenShift(true)} className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold hover:bg-blue-100 transition border border-blue-200">
             <Wallet size={18} /> Abrir Turno de Caja (Opcional)
           </button>
        </div>
      )}

      {scanResult ? (
        <div className={`w-full rounded-3xl shadow-2xl p-6 sm:p-12 flex flex-col items-center justify-center transition-all duration-300 ${scanResult.success ? 'bg-green-500' : 'bg-red-500'} text-white min-h-[400px]`}>
           <div className="h-32 w-32 rounded-full bg-white/20 flex items-center justify-center text-white mb-6 text-6xl shadow-inner border-4 border-white/30">
              {scanResult.member?.photoUrl ? <img src={scanResult.member.photoUrl} alt="avatar" className="h-full w-full rounded-full object-cover" /> : <User size={64} />}
           </div>
           <h2 className="text-3xl sm:text-4xl font-extrabold mb-2 text-center break-words max-w-full">{scanResult.member?.fullName || 'Desconocido'}</h2>
           <p className="text-2xl font-semibold opacity-90 text-center uppercase tracking-widest mt-4 bg-black/20 px-6 py-2 rounded-full">{scanResult.message}</p>
        </div>
      ) : (
        <div className="w-full bg-white rounded-3xl shadow-xl p-5 sm:p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Control de Recepción</h1>
            <p className="text-gray-500 mt-2 font-medium">Lectura de código QR o Cédula</p>
          </div>

          {!scannerOpen ? (
            <div className="flex flex-col items-center gap-6">
               <div className="relative w-full max-w-md">
                 <Keyboard className="absolute left-5 top-4 text-gray-400 h-6 w-6" />
                 <input 
                   ref={inputRef}
                   value={inputValue}
                   onChange={(e) => setInputValue(e.target.value)}
                   onKeyDown={handleKeyDown}
                   placeholder="Pistola USB / Digitar cédula..."
                 className="w-full pl-14 pr-4 py-4 text-xl border-2 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition shadow-sm bg-gray-50 focus:bg-white"
                   disabled={!activeShift && userRole !== 'owner'}
                 />
                 <div className="absolute right-4 top-3.5 text-xs font-bold text-gray-400 bg-gray-200 px-2 py-1 rounded">ENTER</div>
               </div>
               
               <div className="flex items-center gap-4 text-gray-400 w-full max-w-md">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-sm font-semibold uppercase tracking-wider">Operaciones</span>
                  <div className="h-px bg-gray-200 flex-1"></div>
               </div>

               <button disabled={!activeShift && userRole !== 'owner'} onClick={() => setScannerOpen(true)} className="flex items-center justify-center gap-3 w-full max-w-md bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 transition-all">
                 <QrCode size={28} /> Activar Escáner HTML5
               </button>

               <button disabled={!activeShift && userRole !== 'owner'} onClick={() => setShowQuickPass(true)} className="flex items-center justify-center gap-3 w-full max-w-md bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 transition-all">
                 <DollarSign size={28} /> + Cobrar Día / Visita Exprés
               </button>

               <button disabled={!activeShift && userRole !== 'owner'} onClick={() => setShowStore(true)} className="flex items-center justify-center gap-3 w-full max-w-md bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 transition-all">
                 <ShoppingCart size={28} /> 🛒 Tienda / Venta de Mostrador
               </button>
               
               {!activeShift && userRole !== 'owner' && <div className="text-red-500 font-bold mt-2 animate-pulse">¡Debes Abrir Turno para operar!</div>}
            </div>
          ) : (
            <div className="flex flex-col items-center">
               <div id="reader" className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bg-black border-4 border-gray-900"></div>
               <button onClick={() => setScannerOpen(false)} className="mt-6 text-gray-600 hover:bg-gray-100 font-bold px-8 py-3 rounded-xl transition">Cerrar Cámara</button>
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {showOpenShift && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-md w-full relative max-h-[90dvh] overflow-y-auto">
            {userRole === 'owner' && <button onClick={() => setShowOpenShift(false)} className="absolute top-4 right-4 text-gray-400"><X /></button>}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Wallet className="text-blue-600" /> Abrir Turno de Caja</h2>
            <form action={async (formData) => { await openShift(formData); window.location.reload(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Efectivo Inicial / Base ($)</label>
                <input name="initialCash" type="number" required defaultValue="50000" className="w-full border-2 rounded-xl p-3" autoFocus />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition">Abrir Turno y Comenzar</button>
            </form>
          </div>
        </div>
      )}

      {showCloseShift && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-md w-full relative max-h-[90dvh] overflow-y-auto">
            <button onClick={() => setShowCloseShift(false)} className="absolute top-4 right-4 text-gray-400"><X /></button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Lock className="text-gray-900" /> Arqueo y Cierre</h2>
            <div className="bg-gray-50 p-4 rounded-xl mb-6 text-center border">
              <p className="text-sm text-gray-500 uppercase font-bold">Efectivo Esperado del Sistema</p>
              <p className="text-3xl font-black text-gray-800">${activeShift.expectedCash.toLocaleString('es-CO')}</p>
            </div>
            <form action={async (formData) => { await closeShift(formData); window.location.reload(); }} className="space-y-4">
              <input type="hidden" name="shiftId" value={activeShift.id} />
              <input type="hidden" name="expected" value={activeShift.expectedCash} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Efectivo Físico Contado ($)</label>
                <input name="counted" type="number" required defaultValue={activeShift.expectedCash} className="w-full border-2 rounded-xl p-3 focus:ring-gray-900" autoFocus />
              </div>
              <button type="submit" className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition mt-4">Confirmar y Cerrar Turno</button>
            </form>
          </div>
        </div>
      )}

      {showExpense && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-md w-full relative max-h-[90dvh] overflow-y-auto">
            <button onClick={() => setShowExpense(false)} className="absolute top-4 right-4 text-gray-400"><X /></button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><MinusCircle className="text-red-600" /> Registrar Gasto Menor</h2>
            <form action={async (formData) => { 
                setIsSubmittingExpense(true); 
                await registerMinorExpense(formData); 
                setIsSubmittingExpense(false); 
                setShowExpense(false); 
              }} className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del Gasto</label>
                <input name="description" required placeholder="Ej: Botellón de agua" className="w-full border-2 rounded-xl p-3" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto Retirado ($)</label>
                <input name="amount" type="number" required className="w-full border-2 rounded-xl p-3" />
              </div>
              <button disabled={isSubmittingExpense} type="submit" className="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition mt-4 disabled:opacity-50">
                {isSubmittingExpense ? 'Procesando...' : 'Registrar Gasto (Resta de Caja)'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QUICK PASS MODAL */}
      {showQuickPass && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-md w-full relative max-h-[90dvh] overflow-y-auto">
            <button onClick={() => setShowQuickPass(false)} className="absolute top-4 right-4 text-gray-400"><X /></button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6"><DollarSign className="inline text-green-600" /> Visita Exprés</h2>
            <form action={async (formData) => { 
                setIsSubmittingQuickPass(true); 
                const res = await registerQuickPass(formData); 
                setIsSubmittingQuickPass(false); 
                setShowQuickPass(false); 
                setScanResult(res as unknown as AttendanceResult); 
              }} className="space-y-4"
            >
              <input name="documentId" required placeholder="Cédula" className="w-full border-2 rounded-xl p-3" autoFocus />
              <input name="fullName" required placeholder="Nombre Completo" className="w-full border-2 rounded-xl p-3" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input name="amount" type="number" required defaultValue="10000" className="w-full border-2 rounded-xl p-3" placeholder="Monto" />
                <select name="method" className="w-full border-2 rounded-xl p-3 bg-white">
                  <option value="cash">Efectivo</option>
                  <option value="transfer">Transferencia</option>
                </select>
              </div>
              <select name="coachId" className="w-full border-2 rounded-xl p-3 bg-white">
                <option value="">Sin entrenador</option>
                {coaches.map((c: any) => <option key={c.id} value={c.id}>{c.fullName}</option>)}
              </select>
              <button disabled={isSubmittingQuickPass} type="submit" className="w-full bg-green-600 text-white font-bold py-4 rounded-xl mt-4 disabled:opacity-50">
                {isSubmittingQuickPass ? 'Procesando...' : 'Cobrar y Dar Acceso'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STORE MODAL */}
      {showStore && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-md w-full relative max-h-[90dvh] overflow-y-auto">
            <button onClick={() => setShowStore(false)} className="absolute top-4 right-4 text-gray-400"><X /></button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6"><ShoppingCart className="inline text-purple-600" /> Venta de Mostrador</h2>
            <form action={async (formData) => {
                setIsSubmittingStore(true);
                const res = await sellProduct(formData);
                setIsSubmittingStore(false);
                setShowStore(false);
                setScanResult({ success: res.success, message: res.message || '', member: undefined });
              }} className="space-y-4"
            >
              <select name="productId" required className="w-full border-2 rounded-xl p-3 bg-white" onChange={(e) => {
                  const p = products.find(prod => prod.id === e.target.value);
                  if (p) {
                    const qtyInput = document.getElementById('store-qty') as HTMLInputElement;
                    const amountInput = document.getElementById('store-amount') as HTMLInputElement;
                    if (amountInput && qtyInput) amountInput.value = (Number(p.price) * Number(qtyInput.value)).toString();
                  }
              }}>
                <option value="">-- Selecciona un producto --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} - ${Number(p.price).toLocaleString('es-CO')}</option>)}
              </select>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Cantidad</label>
                  <input id="store-qty" name="quantity" type="number" min="1" defaultValue="1" required className="w-full border-2 rounded-xl p-3" onChange={(e) => {
                      const qty = Number(e.target.value);
                      const pId = (document.querySelector('select[name="productId"]') as HTMLSelectElement)?.value;
                      const p = products.find(prod => prod.id === pId);
                      if (p) {
                        const amountInput = document.getElementById('store-amount') as HTMLInputElement;
                        if (amountInput) amountInput.value = (Number(p.price) * qty).toString();
                      }
                  }} />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Total ($)</label>
                  <input id="store-amount" name="amount" type="number" readOnly className="w-full border-2 rounded-xl p-3 bg-gray-100" />
                </div>
              </div>
              
              <select name="method" required className="w-full border-2 rounded-xl p-3 bg-white mt-4">
                <option value="cash">Efectivo</option>
                <option value="transfer">Transferencia</option>
              </select>
              
              <button disabled={isSubmittingStore} type="submit" className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl mt-4 disabled:opacity-50">
                {isSubmittingStore ? 'Procesando...' : 'Procesar Venta Rápida'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
