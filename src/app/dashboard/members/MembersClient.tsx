'use client';

import { useState, useTransition } from 'react';
import { createMember, renewMemberPlan } from '@/app/actions/members';
import { CameraModal } from '@/components/CameraModal';
import {
  Search,
  Plus,
  MessageCircle,
  User,
  AlertTriangle,
  XOctagon,
  CheckCircle2,
  DollarSign,
  RefreshCw,
  X,
  CheckCircle,
  QrCode,
  UserPlus,
  Send,
  Camera,
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

export function MembersClient({
  initialMembers,
  plans,
  coaches = [],
}: {
  initialMembers: any[];
  plans: any[];
  coaches?: any[];
}) {
  const [members, setMembers] = useState(initialMembers);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'healthy' | 'risk' | 'critical' | 'inactive'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createPhotoUrl, setCreatePhotoUrl] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [renewMember, setRenewMember] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRenewing, setIsRenewing] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const filtered = members.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(search.toLowerCase()) || m.documentId.includes(search);
    if (!matchesSearch) return false;
    const isInactive = !m.endDate || new Date(m.endDate) < new Date();
    if (filter === 'healthy') return m.churnStatus === 'healthy';
    if (filter === 'risk') return m.churnStatus === 'risk';
    if (filter === 'critical') return m.churnStatus === 'critical' && !isInactive;
    if (filter === 'inactive') return isInactive;
    return true;
  });

  const healthyCount = members.filter((m) => m.churnStatus === 'healthy').length;
  const riskCount = members.filter((m) => m.churnStatus === 'risk').length;
  const inactiveCount = members.filter((m) => !m.endDate || new Date(m.endDate) < new Date()).length;
  const criticalCount = members.filter(
    (m) => m.churnStatus === 'critical' && !(!m.endDate || new Date(m.endDate) < new Date())
  ).length;
  const moneyAtRisk = members
    .filter((m) => m.churnStatus !== 'healthy')
    .reduce((sum, m) => sum + Number(m.planPrice || 0), 0);

  const handleWhatsAppAction = (member: any) => {
    if (!member.phone) return;
    let cleaned = member.phone.replace(/\D/g, '');
    if (cleaned.length === 10) cleaned = '57' + cleaned;
    let text = '';
    const dateStr = member.endDate ? new Date(member.endDate).toLocaleDateString('es-CO') : 'pronto';
    if (member.churnStatus === 'risk') {
      text = `Hola ${member.fullName}, te escribimos del gimnasio. Notamos que tu membresía vence pronto (${dateStr}). ¿Deseas renovar?`;
    } else if (member.churnStatus === 'critical') {
      text = `Hola ${member.fullName}, ¡te extrañamos en el gimnasio! Hace días no te vemos. Cuéntanos si necesitas ajustar tu plan.`;
    } else {
      const url = `${window.location.origin}/pass/${member.qrAccessToken}`;
      text = `¡Hola! Aquí tienes tu carnet digital de acceso al gimnasio: ${url}`;
    }
    window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleResendPass = (member: any) => {
    if (!member.phone) {
      showToast('El socio no tiene un teléfono registrado.', 'error');
      return;
    }
    let cleaned = member.phone.replace(/\D/g, '');
    if (cleaned.length === 10) cleaned = '57' + cleaned;
    const passUrl = `${window.location.origin}/pass/${member.qrAccessToken}`;
    const text = `Hola ${member.fullName} 💪, aquí tienes tu carnet digital de acceso al gimnasio: ${passUrl}\n\nPreséntalo en recepción para ingresar.`;
    window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`, '_blank');
    showToast('Enlace de carnet generado para WhatsApp', 'success');
  };

  async function handleCreate(formData: FormData) {
    if (createPhotoUrl) {
      formData.append('photoUrl', createPhotoUrl);
    }
    startTransition(async () => {
      const res = await createMember(formData);
      if (res.success) {
        showToast('Socio creado exitosamente.', 'success');
        setIsCreateModalOpen(false);
        setCreatePhotoUrl(null);
        window.location.reload();
      } else {
        showToast(res.error, 'error');
      }
    });
  }

  async function handleRenew(formData: FormData) {
    setIsRenewing(true);
    const res = await renewMemberPlan(formData);
    setIsRenewing(false);
    if (res.success) {
      const planName = plans.find((p) => p.id === formData.get('planId'))?.name || 'Plan';
      showToast(`Plan "${planName}" renovado exitosamente.`, 'success');
      setRenewMember(null);
      window.location.reload();
    } else {
      showToast(res.error, 'error');
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* COMPACT PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Gestión de Miembros</h1>
          <p className="text-xs text-slate-500">
            Control de altas, retención de cartera y emisión de carnets QR
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Nuevo Socio</span>
        </button>
      </div>

      {/* COMPACT KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setFilter('healthy')}
          className={`cursor-pointer bg-white p-5 rounded-xl border shadow-xs transition-colors ${
            filter === 'healthy'
              ? 'border-emerald-500 ring-1 ring-emerald-500'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Saludables</span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-medium px-2 py-0.5 rounded-full">
              Al día
            </span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums mt-3">
            {healthyCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Asistencia regular y plan activo</p>
        </div>

        <div
          onClick={() => setFilter('risk')}
          className={`cursor-pointer bg-white p-5 rounded-xl border shadow-xs transition-colors ${
            filter === 'risk'
              ? 'border-amber-500 ring-1 ring-amber-500'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">En Riesgo</span>
            <span className="bg-amber-50 text-amber-700 border border-amber-200/60 text-xs font-medium px-2 py-0.5 rounded-full">
              Por vencer
            </span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums mt-3">
            {riskCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Vence en &le; 7 días o baja asistencia</p>
        </div>

        <div
          onClick={() => setFilter('critical')}
          className={`cursor-pointer bg-white p-5 rounded-xl border shadow-xs transition-colors ${
            filter === 'critical'
              ? 'border-rose-500 ring-1 ring-rose-500'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Críticos</span>
            <span className="bg-rose-50 text-rose-700 border border-rose-200/60 text-xs font-medium px-2 py-0.5 rounded-full">
              Ausentes
            </span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums mt-3">
            {criticalCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">&gt; 10 días sin registrar ingreso</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Cartera en Riesgo</span>
            <span className="p-1 rounded-md bg-slate-100 text-slate-700">
              <DollarSign className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums mt-3">
            ${moneyAtRisk.toLocaleString('es-CO')}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Valor de planes con riesgo de churn</p>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none bg-white placeholder:text-slate-400"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none bg-white font-medium text-slate-700"
          >
            <option value="all">Todos los estados</option>
            <option value="healthy">🟢 Saludables</option>
            <option value="risk">🟡 En Riesgo</option>
            <option value="critical">🔴 Críticos</option>
            <option value="inactive">⚪ Inactivos</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 self-end sm:self-center font-medium">
          Mostrando <span className="font-semibold text-slate-900">{filtered.length}</span> de{' '}
          {members.length} socios
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Socio / Documento</th>
                <th className="py-3 px-4">Teléfono</th>
                <th className="py-3 px-4">Última Visita</th>
                <th className="py-3 px-4">Plan / Vigencia</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((member, index) => {
                const isInactive = !member.endDate || new Date(member.endDate) < new Date();
                let statusBadge = (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-medium px-2 py-0.5 rounded-full">
                    Al día
                  </span>
                );
                if (member.churnStatus === 'risk') {
                  statusBadge = (
                    <span className="bg-amber-50 text-amber-700 border border-amber-200/60 text-xs font-medium px-2 py-0.5 rounded-full">
                      En Riesgo
                    </span>
                  );
                } else if (member.churnStatus === 'critical') {
                  statusBadge = (
                    <span className="bg-rose-50 text-rose-700 border border-rose-200/60 text-xs font-medium px-2 py-0.5 rounded-full">
                      Crítico
                    </span>
                  );
                }
                if (isInactive) {
                  statusBadge = (
                    <span className="bg-slate-100 text-slate-600 border border-slate-200/60 text-xs font-medium px-2 py-0.5 rounded-full">
                      Inactivo
                    </span>
                  );
                }

                return (
                  <tr
                    key={`${member.id}-${index}`}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200/60">
                          {member.fullName
                            ?.split(' ')
                            .map((n: string) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block leading-tight">
                            {member.fullName}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {member.documentId}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-600">
                      {member.phone || '—'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {member.daysSinceLastAttendance === -1
                        ? 'Nunca'
                        : member.daysSinceLastAttendance === 0
                        ? 'Hoy'
                        : `Hace ${member.daysSinceLastAttendance}d`}
                    </td>
                    <td className="py-3 px-4">
                      {member.planName ? (
                        <div>
                          <span className="text-xs font-semibold text-slate-800 block">
                            {member.planName}
                          </span>
                          {member.endDate && (
                            <span className="text-[11px] text-slate-400">
                              Vence:{' '}
                              {new Date(member.endDate).toLocaleDateString('es-CO', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Sin plan</span>
                      )}
                    </td>
                    <td className="py-3 px-4">{statusBadge}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleResendPass(member)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
                          title="Reenviar carnet QR por WhatsApp"
                        >
                          <QrCode className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setRenewMember(member)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
                          title="Renovar / Extender plan"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleWhatsAppAction(member)}
                          disabled={!member.phone}
                          className={`p-1.5 rounded-md transition ${
                            member.phone
                              ? 'text-slate-500 hover:text-emerald-600 hover:bg-slate-100'
                              : 'text-slate-300 cursor-not-allowed'
                          }`}
                          title={
                            member.phone
                              ? 'Contactar por WhatsApp'
                              : 'Sin teléfono registrado'
                          }
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center justify-center">
                      <div className="h-10 w-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center mb-3 border border-slate-200/80">
                        <UserPlus className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {members.length === 0
                          ? 'Aún no tienes socios registrados'
                          : 'No se encontraron resultados'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 mb-4">
                        {members.length === 0
                          ? 'Registra tu primer cliente para emitir su carnet QR y controlar accesos.'
                          : 'Prueba cambiando los filtros o el término de búsqueda.'}
                      </p>
                      {members.length === 0 ? (
                        <button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3.5 rounded-lg transition"
                        >
                          + Registrar Primer Socio
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSearch('');
                            setFilter('all');
                          }}
                          className="text-xs font-medium text-slate-600 hover:text-slate-900 underline"
                        >
                          Limpiar búsqueda
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Crear Socio */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 w-full max-w-md max-h-[90dvh] overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-900">Registrar Nuevo Socio</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form action={handleCreate} className="space-y-3.5">
              {/* Foto del Socio (Opcional) */}
              <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 flex items-center gap-3.5">
                <div className="h-16 w-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 relative shadow-2xs">
                  {createPhotoUrl ? (
                    <img src={createPhotoUrl} alt="Foto Socio" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-7 w-7 text-slate-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-800">Foto del Socio (Opcional)</p>
                    {createPhotoUrl && (
                      <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Foto lista
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {createPhotoUrl ? 'Visible en su carnet digital QR y acceso' : 'Para carnet digital y validación en recepción'}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    {!createPhotoUrl ? (
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
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => setCreatePhotoUrl(ev.target?.result as string);
                                reader.readAsDataURL(file);
                              }
                            }}
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
                          onClick={() => setCreatePhotoUrl(null)}
                          className="text-rose-600 hover:text-rose-700 text-xs font-medium px-2 py-1.5 rounded-lg hover:bg-rose-50 transition"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  name="fullName"
                  required
                  placeholder="Ej. Juan Pérez"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Cédula / Documento *
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
                    Teléfono / WhatsApp *
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
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Plan Inicial (Opcional)
                </label>
                <select
                  name="planId"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none bg-white font-medium"
                >
                  <option value="">-- Sin plan asignado --</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ${Number(p.price).toLocaleString('es-CO')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-60 transition shadow-2xs"
                >
                  {isPending ? 'Guardando...' : 'Guardar Socio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={(dataUrl) => {
          setCreatePhotoUrl(dataUrl);
          showToast('Foto capturada correctamente', 'success');
        }}
      />

      {/* MODAL: Renovar / Cobrar Plan */}
      {renewMember && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 w-full max-w-md max-h-[90dvh] overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900">Renovación de Membresía</h2>
              </div>
              <button
                onClick={() => setRenewMember(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 mb-4 text-xs">
              <p className="font-semibold text-slate-800">{renewMember.fullName}</p>
              {renewMember.planName && (
                <p className="text-slate-500 mt-0.5">
                  Plan actual: {renewMember.planName}{' '}
                  {renewMember.endDate &&
                    `· Vence ${new Date(renewMember.endDate).toLocaleDateString('es-CO')}`}
                </p>
              )}
            </div>

            <form
              action={async (formData) => {
                await handleRenew(formData);
              }}
              className="space-y-3.5"
            >
              <input type="hidden" name="memberId" value={renewMember.id} />
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nuevo Plan a Asignar *
                </label>
                <select
                  name="planId"
                  required
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none bg-white font-medium"
                >
                  <option value="">-- Elige un plan comercial --</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.durationDays}d) · ${Number(p.price).toLocaleString('es-CO')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Método de Pago *
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
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Ref. / Comprobante
                  </label>
                  <input
                    name="referenceNumber"
                    placeholder="Opcional"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>
              </div>

              {coaches.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Entrenador Responsable
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
              )}

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setRenewMember(null)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isRenewing}
                  className="flex-1 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-60 transition shadow-2xs"
                >
                  {isRenewing ? 'Confirmando...' : 'Confirmar Renovación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
