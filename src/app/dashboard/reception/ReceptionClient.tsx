'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { registerAttendance, AttendanceResult } from '@/app/actions/attendance';
import { registerQuickPass } from '@/app/actions/quickPass';
import { sellProduct } from '@/app/actions/products';
import { openShift, closeShift, registerMinorExpense } from '@/app/actions/cash_shifts';
import { registerWalkInMember } from '@/app/actions/members';
import { CameraModal } from '@/components/CameraModal';
import {
  User,
  QrCode,
  Keyboard,
  DollarSign,
  X,
  ShoppingCart,
  Lock,
  Unlock,
  MinusCircle,
  Wallet,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Camera,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Check,
  Building2,
  Clock,
  ScanLine,
} from 'lucide-react';

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed top-4 right-4 z-[100] max-w-sm w-full shadow-lg rounded-xl p-4 flex items-start gap-3 border backdrop-blur-md ${
        type === 'error'
          ? 'bg-rose-50/95 border-rose-200 text-rose-900'
          : 'bg-emerald-50/95 border-emerald-200 text-emerald-900'
      }`}
    >
      {type === 'error' ? (
        <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
      ) : (
        <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
      )}
      <p className="text-xs font-medium flex-1">{message}</p>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 shrink-0"
        aria-label="Cerrar notificación"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ReceptionClient({
  coaches = [],
  products = [],
  plans = [],
  activeShift = null,
  userRole = 'receptionist',
  liveMetrics = null,
}: {
  coaches?: any[];
  products?: any[];
  plans?: any[];
  activeShift?: any;
  userRole?: string;
  liveMetrics?: any;
}) {
  const [inputValue, setInputValue] = useState('');
  const [scanResult, setScanResult] = useState<AttendanceResult | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'register' | 'quickPass' | 'store'>('register');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Shift & Cash Modals
  const [showOpenShift, setShowOpenShift] = useState(!activeShift && userRole !== 'owner');
  const [showCloseShift, setShowCloseShift] = useState(false);
  const [showExpense, setShowExpense] = useState(false);

  // Submitting states
  const [isSubmittingQuickPass, setIsSubmittingQuickPass] = useState(false);
  const [isSubmittingStore, setIsSubmittingStore] = useState(false);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);

  // Store form state
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [storeQty, setStoreQty] = useState(1);

  // Walk-in form photo state
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    if (!scannerOpen && !showOpenShift && !showCloseShift && !showExpense) {
      inputRef.current?.focus();
    }
  }, [scannerOpen, showOpenShift, showCloseShift, showExpense]);

  useEffect(() => {
    if (scanResult) {
      const timer = setTimeout(() => {
        setScanResult(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [scanResult]);

  useEffect(() => {
    if (scannerOpen) {
      const scanner = new Html5QrcodeScanner(
        'reader',
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          videoConstraints: { facingMode: 'environment' },
        },
        false
      );
      scanner.render(
        async (decodedText) => {
          scanner.clear();
          setScannerOpen(false);
          await handleValidation(decodedText, 'qr_scan');
        },
        () => {}
      );
      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [scannerOpen]);

  const handleValidation = async (query: string, method: 'qr_scan' | 'manual_doc') => {
    if (!query) return;
    try {
      const res = await registerAttendance(query, method);
      setScanResult(res);
      setInputValue('');
    } catch {
      setScanResult({ success: false, message: 'Error de servidor al validar acceso' });
      setInputValue('');
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleValidation(inputValue, 'manual_doc');
    }
  };


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setPhotoUrl(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Form submit handlers
  const handleQuickPassSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingQuickPass(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await registerQuickPass(formData);
      setIsSubmittingQuickPass(false);
      setScanResult(res as unknown as AttendanceResult);
      showToast('Cobro diario registrado con éxito.', 'success');
      (e.target as HTMLFormElement).reset();
    } catch {
      setIsSubmittingQuickPass(false);
      showToast('Error al procesar el pase diario.', 'error');
    }
  };

  const handleStoreSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingStore(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await sellProduct(formData);
      setIsSubmittingStore(false);
      if (res.success) {
        showToast(res.message || 'Venta registrada con éxito.', 'success');
        setScanResult({ success: true, message: res.message || 'Venta registrada' });
        (e.target as HTMLFormElement).reset();
        setSelectedProduct(null);
        setStoreQty(1);
      } else {
        showToast(res.message || 'Error al procesar la venta.', 'error');
      }
    } catch {
      setIsSubmittingStore(false);
      showToast('Error al registrar la venta en el sistema.', 'error');
    }
  };

  const handleWalkInSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingMember(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (photoUrl) {
        formData.append('photoUrl', photoUrl);
      }
      const res = await registerWalkInMember(formData);
      setIsSubmittingMember(false);
      if (res.success && res.data) {
        showToast(`Socio ${res.data.fullName} registrado correctamente.`, 'success');
        const passUrl = `${window.location.origin}/pass/${res.data.passToken}`;
        const msg = encodeURIComponent(
          `¡Hola ${res.data.fullName}! Tu registro en SupraData fue exitoso. Accede a tu carnet digital aquí: ${passUrl}`
        );
        window.open(`https://wa.me/57${res.data.phone}?text=${msg}`, '_blank');
        setPhotoUrl(null);
        (e.target as HTMLFormElement).reset();
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showToast(!res.success ? res.error : 'Ocurrió un error al registrar el socio.', 'error');
      }
    } catch {
      setIsSubmittingMember(false);
      showToast('Error inesperado al registrar el socio.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* TOP HEADER & LIVE METRICS BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Mostrador de Recepción</h1>
          <p className="text-xs text-slate-500">
            Control de accesos en tiempo real, validación de carnets y cobros de mostrador
          </p>
        </div>

        {/* Live Metrics Chips & Shift Status */}
        <div className="flex items-center flex-wrap gap-2">
          {liveMetrics && (
            <>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200/80 text-xs shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Aforo:</span>
                <span className="font-bold tabular-nums text-slate-900">
                  {liveMetrics.peopleInGymCount}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200/80 text-xs shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Activos:</span>
                <span className="font-bold tabular-nums text-emerald-600">
                  {liveMetrics.activeMembersCount}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200/80 text-xs shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Por Vencer:</span>
                <span className="font-bold tabular-nums text-amber-600">
                  {liveMetrics.expiringSoonCount}
                </span>
              </div>
            </>
          )}

          {activeShift ? (
            <div className="inline-flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-md bg-slate-900 text-white text-xs shadow-2xs">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium text-slate-200">
                Caja: ${activeShift.expectedCash.toLocaleString('es-CO')}
              </span>
              <div className="flex items-center gap-1 border-l border-slate-700 pl-1.5">
                <button
                  onClick={() => setShowExpense(true)}
                  className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-rose-300 hover:text-white hover:bg-slate-800 transition"
                  title="Registrar gasto menor"
                >
                  - Gasto
                </button>
                <button
                  onClick={() => setShowCloseShift(true)}
                  className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  title="Arqueo y cierre de turno"
                >
                  Cerrar Turno
                </button>
              </div>
            </div>
          ) : userRole === 'owner' ? (
            <button
              onClick={() => setShowOpenShift(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-2xs transition"
            >
              <Wallet className="h-3.5 w-3.5 text-slate-300" />
              Abrir Turno de Caja
            </button>
          ) : (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              <AlertTriangle className="h-3.5 w-3.5" /> Turno no iniciado
            </div>
          )}
        </div>
      </div>

      {/* SPLIT SCREEN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* COLUMNA IZQUIERDA: MONITOR DE ACCESO / VALIDACIÓN (7 cols)                 */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Monitor Header */}
            <div className="px-5 py-3.5 bg-slate-50/75 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScanLine className="h-4 w-4 text-slate-700" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Monitor de Validación
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {scannerOpen ? 'Cámara Activa' : 'Lector Listo'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setScannerOpen(!scannerOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200/80 rounded-md transition shadow-2xs"
              >
                <Camera className="h-3.5 w-3.5 text-slate-500" />
                <span>{scannerOpen ? 'Ocultar Cámara' : 'Cámara QR'}</span>
              </button>
            </div>

            {/* Input de Pistola USB / Búsqueda Manual */}
            <div className="p-5 border-b border-slate-100">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!inputValue) return;
                  await handleValidation(inputValue, 'manual_doc');
                }}
                className="relative flex items-center"
              >
                <Keyboard className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escanear pistola USB o digitar cédula / ID..."
                  disabled={!activeShift && userRole !== 'owner'}
                  className="w-full pl-10 pr-24 py-2 text-sm font-medium rounded-lg text-slate-900 placeholder:text-slate-400 bg-slate-50/60 border border-slate-200 focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none transition disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!inputValue || (!activeShift && userRole !== 'owner')}
                  className="absolute right-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition shadow-2xs"
                >
                  Validar
                </button>
              </form>
              <p className="text-[11px] text-slate-400 mt-1.5 pl-1">
                Presiona Enter tras disparar el lector de código de barras o código QR.
              </p>
            </div>

            {/* Monitor Display Area (Camera OR Member Validation Card OR Idle Status) */}
            <div className="p-5 min-h-[340px] flex flex-col justify-center">
              {scannerOpen ? (
                <div className="flex flex-col items-center">
                  <div
                    id="reader"
                    className="w-full max-w-sm rounded-xl overflow-hidden border border-slate-200 p-2 text-slate-800 [&_button]:bg-slate-900 [&_button]:text-white [&_button]:text-xs [&_button]:px-3 [&_button]:py-1.5 [&_button]:rounded-md [&_select]:text-xs [&_select]:p-1.5 [&_select]:border [&_select]:rounded-md"
                  />
                  <button
                    onClick={() => setScannerOpen(false)}
                    className="mt-4 text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md border border-slate-200"
                  >
                    Cerrar Visor de Cámara
                  </button>
                </div>
              ) : scanResult ? (
                /* TARJETA TÉCNICA DEL SOCIO VALIDADO */
                <div
                  className={`rounded-xl p-5 border transition-all ${
                    scanResult.success
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : (scanResult as any).antiPassbackViolation
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-rose-50/60 border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Foto del Socio */}
                      <div className="h-18 w-18 rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden shrink-0 flex items-center justify-center relative">
                        {scanResult.member?.photoUrl ? (
                          <img
                            src={scanResult.member.photoUrl}
                            alt="Foto socio"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <User className="h-8 w-8 text-slate-300" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                              Sin Foto
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info del Socio */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">
                            {scanResult.member?.fullName || 'Visitante no registrado'}
                          </h3>
                        </div>

                        {scanResult.member?.documentId && (
                          <p className="text-xs font-mono text-slate-500">
                            ID: {scanResult.member.documentId}
                          </p>
                        )}

                        <div className="pt-1">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                              scanResult.success
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : (scanResult as any).antiPassbackViolation
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                            }`}
                          >
                            {scanResult.success
                              ? '🟢 Acceso Permitido'
                              : (scanResult as any).antiPassbackViolation
                              ? '🟡 Ingreso Duplicado'
                              : '🔴 Acceso Denegado'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setScanResult(null)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                      title="Cerrar resultado"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Detalle del Mensaje */}
                  <div className="mt-4 p-3 bg-white/80 rounded-lg border border-slate-200/80 text-xs font-medium text-slate-700 flex items-center justify-between">
                    <span>{scanResult.message}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date().toLocaleTimeString('es-CO', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ) : (
                /* ESTADO EN ESPERA (IDLE) */
                <div className="h-full flex flex-col items-center justify-center text-center py-10 px-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 mb-3 shadow-2xs">
                    <QrCode className="h-6 w-6 text-slate-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Lector en espera de escaneo
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Apunta la pistola USB al código QR del socio o digita su número de cédula en la barra
                    superior para validar vigencia.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* MOVIMIENTOS RECIENTES DEL TURNO (Format: High-density compact table) */}
          {activeShift && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-5 py-3 bg-slate-50/75 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Movimientos del Turno Actual
                </span>
                <span className="text-xs text-slate-500">
                  {activeShift.transactions?.length || 0} operaciones
                </span>
              </div>

              <div className="overflow-x-auto max-h-56 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-2 px-4">Hora</th>
                      <th className="py-2 px-4">Detalle</th>
                      <th className="py-2 px-4">Método</th>
                      <th className="py-2 px-4 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {activeShift.transactions?.map((tx: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2 px-4 text-slate-500 tabular-nums">
                          {new Date(tx.date).toLocaleTimeString('es-CO', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2 px-4 font-medium text-slate-800 truncate max-w-[200px]">
                          {tx.description}
                        </td>
                        <td className="py-2 px-4">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              tx.method === 'cash'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {tx.method === 'cash' ? 'Efectivo' : 'Transf.'}
                          </span>
                        </td>
                        <td
                          className={`py-2 px-4 text-right font-bold tabular-nums ${
                            tx.status === 'voided'
                              ? 'text-slate-400 line-through'
                              : tx.type === 'income'
                              ? 'text-emerald-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toLocaleString('es-CO')}
                        </td>
                      </tr>
                    ))}
                    {(!activeShift.transactions || activeShift.transactions.length === 0) && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                          No hay transacciones registradas en este turno aún.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* COLUMNA DERECHA: ACCIONES RÁPIDAS DE MOSTRADOR (5 cols)                    */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Header con Pestañas Técnicas Compactas */}
            <div className="p-3 bg-slate-50/75 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1 w-full bg-slate-200/60 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all text-center ${
                    activeTab === 'register'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Registrar Socio
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('quickPass')}
                  className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all text-center ${
                    activeTab === 'quickPass'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cobro Diario
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('store')}
                  className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all text-center ${
                    activeTab === 'store'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Venta Tienda
                </button>
              </div>
            </div>

            {/* TAB 1: REGISTRAR SOCIO */}
            {activeTab === 'register' && (
              <form onSubmit={handleWalkInSubmit} className="p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Inscripción y Membresía</h2>
                    <p className="text-[11px] text-slate-500">
                      Crea la ficha del socio, asigna plan y genera su carnet QR
                    </p>
                  </div>
                </div>

                {/* Foto del Socio (Opcional) */}
                <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 flex items-center gap-3.5">
                  <div className="h-16 w-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 relative shadow-2xs">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Foto Socio" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-7 w-7 text-slate-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-800">Foto del Socio (Opcional)</p>
                      {photoUrl && (
                        <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Foto lista
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {photoUrl ? 'Visible en su carnet digital QR y acceso' : 'Para carnet digital y validación en recepción'}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      {!photoUrl ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setIsCameraModalOpen(true)}
                            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-2xs active:scale-95"
                          >
                            Tomar Foto
                          </button>
                          <label className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium px-2.5 py-1.5 rounded-lg transition cursor-pointer shadow-2xs">
                            Subir Archivo
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setIsCameraModalOpen(true)}
                            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition shadow-2xs active:scale-95"
                          >
                            Cambiar Foto
                          </button>
                          <button
                            type="button"
                            onClick={() => setPhotoUrl(null)}
                            className="text-rose-600 hover:text-rose-700 text-xs font-medium px-2 py-1.5 rounded-lg hover:bg-rose-50 transition"
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <CameraModal
                  isOpen={isCameraModalOpen}
                  onClose={() => setIsCameraModalOpen(false)}
                  onCapture={(dataUrl) => {
                    setPhotoUrl(dataUrl);
                    showToast('Foto capturada correctamente', 'success');
                  }}
                />

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      name="fullName"
                      required
                      placeholder="Ej. Juan Pérez"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Cédula / ID *
                      </label>
                      <input
                        name="documentId"
                        required
                        placeholder="10203040"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        WhatsApp *
                      </label>
                      <input
                        name="phone"
                        required
                        type="tel"
                        placeholder="3001234567"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Plan *</label>
                      <select
                        name="planId"
                        required
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none bg-white font-medium"
                      >
                        <option value="">Seleccionar plan...</option>
                        {plans.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (${Number(p.price).toLocaleString('es-CO')})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Método Pago *
                      </label>
                      <select
                        name="method"
                        required
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none bg-white font-medium"
                      >
                        <option value="cash">Efectivo</option>
                        <option value="transfer">Transferencia</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingMember || (!activeShift && userRole !== 'owner')}
                    className="w-full bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 text-xs font-semibold py-2 px-4 rounded-lg transition shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>{isSubmittingMember ? 'Guardando...' : 'Registrar y Emitir Carnet'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: COBRO DIARIO (QUICK PASS) */}
            {activeTab === 'quickPass' && (
              <form onSubmit={handleQuickPassSubmit} className="p-5 space-y-3.5">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Cobro de Visita / Pase Exprés</h2>
                  <p className="text-[11px] text-slate-500">
                    Ingreso para visitantes de un solo día sin registro de membresía completa
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Cédula *
                      </label>
                      <input
                        name="documentId"
                        required
                        placeholder="Documento"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Nombre Completo *
                      </label>
                      <input
                        name="fullName"
                        required
                        placeholder="Nombre del visitante"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Monto ($) *
                      </label>
                      <input
                        name="amount"
                        type="number"
                        required
                        defaultValue="10000"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none tabular-nums font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Método Pago *
                      </label>
                      <select
                        name="method"
                        required
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none bg-white font-medium"
                      >
                        <option value="cash">Efectivo</option>
                        <option value="transfer">Transferencia</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Entrenador Responsable (Opcional)
                    </label>
                    <select
                      name="coachId"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none bg-white font-medium"
                    >
                      <option value="">Sin entrenador asignado</option>
                      {coaches.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingQuickPass || (!activeShift && userRole !== 'owner')}
                    className="w-full bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 text-xs font-semibold py-2 px-4 rounded-lg transition shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{isSubmittingQuickPass ? 'Procesando...' : 'Cobrar y Conceder Acceso'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: VENTA TIENDA */}
            {activeTab === 'store' && (
              <form onSubmit={handleStoreSubmit} className="p-5 space-y-3.5">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Venta Rápida de Tienda</h2>
                  <p className="text-[11px] text-slate-500">
                    Bebidas, suplementos y accesorios de mostrador
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Seleccionar Producto *
                    </label>
                    <select
                      name="productId"
                      required
                      value={selectedProduct?.id || ''}
                      onChange={(e) => {
                        const p = products.find((prod) => prod.id === e.target.value);
                        setSelectedProduct(p || null);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none bg-white font-medium"
                    >
                      <option value="">-- Elige un producto del inventario --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} - ${Number(p.price).toLocaleString('es-CO')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Cantidad *
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        min="1"
                        value={storeQty}
                        onChange={(e) => setStoreQty(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Total a Cobrar
                      </label>
                      <div className="px-3 py-1.5 text-xs font-bold text-slate-900 bg-slate-50 rounded-lg border border-slate-200 tabular-nums">
                        $
                        {(
                          Number(selectedProduct?.price || 0) * storeQty
                        ).toLocaleString('es-CO')}
                      </div>
                      <input
                        type="hidden"
                        name="amount"
                        value={Number(selectedProduct?.price || 0) * storeQty}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Método Pago *
                    </label>
                    <select
                      name="method"
                      required
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none bg-white font-medium"
                    >
                      <option value="cash">Efectivo</option>
                      <option value="transfer">Transferencia</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={
                      !selectedProduct || isSubmittingStore || (!activeShift && userRole !== 'owner')
                    }
                    className="w-full bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 text-xs font-semibold py-2 px-4 rounded-lg transition shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart className="h-3.5 w-3.5 text-blue-400" />
                    <span>{isSubmittingStore ? 'Procesando...' : 'Registrar Venta'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODALES TÉCNICOS: APERTURA, CIERRE Y GASTOS DE CAJA                      */}
      {/* ========================================================================= */}

      {/* Modal Abrir Turno */}
      {showOpenShift && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 max-w-sm w-full relative animate-in fade-in zoom-in-95 duration-100">
            {userRole === 'owner' && (
              <button
                onClick={() => setShowOpenShift(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-900">
                <Wallet className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Apertura de Turno de Caja</h3>
                <p className="text-[11px] text-slate-500">Ingresa la base inicial en efectivo</p>
              </div>
            </div>

            <form
              action={async (formData) => {
                const res = await openShift(formData);
                if (res.success) {
                  window.location.reload();
                } else {
                  showToast((res as any).message || 'Error al abrir el turno.', 'error');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Efectivo Base ($)
                </label>
                <input
                  name="initialCash"
                  type="number"
                  required
                  defaultValue="50000"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none tabular-nums font-semibold"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold py-2.5 px-4 rounded-lg transition shadow-2xs"
              >
                Iniciar Turno
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cerrar Turno */}
      {showCloseShift && activeShift && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 max-w-sm w-full relative animate-in fade-in zoom-in-95 duration-100">
            <button
              onClick={() => setShowCloseShift(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-900">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Arqueo y Cierre de Turno</h3>
                <p className="text-[11px] text-slate-500">Verifica el efectivo físico presente</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 mb-4 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Efectivo Esperado en Sistema
              </p>
              <p className="text-xl font-bold tabular-nums text-slate-900 mt-0.5">
                ${activeShift.expectedCash.toLocaleString('es-CO')}
              </p>
            </div>

            <form
              action={async (formData) => {
                const res = await closeShift(formData);
                if (res.success) {
                  window.location.reload();
                } else {
                  showToast((res as any).message || 'Error al cerrar el turno.', 'error');
                }
              }}
              className="space-y-4"
            >
              <input type="hidden" name="shiftId" value={activeShift.id} />
              <input type="hidden" name="expected" value={activeShift.expectedCash} />
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Efectivo Físico Contado ($)
                </label>
                <input
                  name="counted"
                  type="number"
                  required
                  defaultValue={activeShift.expectedCash}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none tabular-nums font-semibold"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold py-2.5 px-4 rounded-lg transition shadow-2xs"
              >
                Confirmar y Cerrar Turno
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Gasto Menor */}
      {showExpense && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 max-w-sm w-full relative animate-in fade-in zoom-in-95 duration-100">
            <button
              onClick={() => setShowExpense(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
                <MinusCircle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Registrar Gasto Menor</h3>
                <p className="text-[11px] text-slate-500">Salida de efectivo de la caja de turno</p>
              </div>
            </div>

            <form
              action={async (formData) => {
                setIsSubmittingExpense(true);
                const res = await registerMinorExpense(formData);
                setIsSubmittingExpense(false);
                if (res.success) {
                  setShowExpense(false);
                  showToast('Gasto registrado correctamente.', 'success');
                } else {
                  showToast((res as any).message || 'Error al registrar el gasto.', 'error');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Descripción del Gasto
                </label>
                <input
                  name="description"
                  required
                  placeholder="Ej. Compra de agua o botellón"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Monto ($)</label>
                <input
                  name="amount"
                  type="number"
                  required
                  placeholder="5000"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none tabular-nums font-semibold"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmittingExpense}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold py-2.5 px-4 rounded-lg transition shadow-2xs disabled:opacity-50"
              >
                {isSubmittingExpense ? 'Guardando...' : 'Registrar Salida de Efectivo'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
