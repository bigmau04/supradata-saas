'use client';
import { useState, useTransition } from 'react';
import { createMember, renewMemberPlan } from '@/app/actions/members';
import { Search, Plus, MessageCircle, User, AlertTriangle, XOctagon, CheckCircle2, DollarSign, RefreshCw, X, CheckCircle } from 'lucide-react';

// ─── Toast component ──────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  return (
    <div className={`fixed top-4 right-4 z-[100] max-w-sm w-full shadow-2xl rounded-2xl p-4 flex items-start gap-3 border transition-all animate-in slide-in-from-top-4 duration-300 ${
      type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'
    }`}>
      {type === 'error'
        ? <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        : <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
      }
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0"><X className="h-4 w-4" /></button>
    </div>
  );
}

export function MembersClient({ initialMembers, plans, coaches = [] }: { initialMembers: any[], plans: any[], coaches?: any[] }) {
  const [members, setMembers] = useState(initialMembers);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'healthy' | 'risk' | 'critical' | 'inactive'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [renewMember, setRenewMember] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRenewing, setIsRenewing] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const filtered = members.filter(m => {
    const matchesSearch = m.fullName.toLowerCase().includes(search.toLowerCase()) || m.documentId.includes(search);
    if (!matchesSearch) return false;
    const isInactive = !m.endDate || new Date(m.endDate) < new Date();
    if (filter === 'healthy') return m.churnStatus === 'healthy';
    if (filter === 'risk') return m.churnStatus === 'risk';
    if (filter === 'critical') return m.churnStatus === 'critical' && !isInactive;
    if (filter === 'inactive') return isInactive;
    return true;
  });

  const healthyCount = members.filter(m => m.churnStatus === 'healthy').length;
  const riskCount = members.filter(m => m.churnStatus === 'risk').length;
  const inactiveCount = members.filter(m => !m.endDate || new Date(m.endDate) < new Date()).length;
  const criticalCount = members.filter(m => m.churnStatus === 'critical' && !(!m.endDate || new Date(m.endDate) < new Date())).length;
  const moneyAtRisk = members.filter(m => m.churnStatus !== 'healthy').reduce((sum, m) => sum + Number(m.planPrice || 0), 0);

  const handleWhatsAppAction = (member: any) => {
    if (!member.phone) return;
    let cleaned = member.phone.replace(/\D/g, '');
    if (cleaned.length === 10) cleaned = '57' + cleaned;
    let text = '';
    const dateStr = member.endDate ? new Date(member.endDate).toLocaleDateString('es-CO') : 'pronto';
    if (member.churnStatus === 'risk') {
      text = `Hola ${member.fullName}, te escribimos del gimnasio. Notamos que tu membresia vence pronto (${dateStr}). Deseas renovar?`;
    } else if (member.churnStatus === 'critical') {
      text = `Hola ${member.fullName}, te extranamos en el gimnasio! Hace dias no te vemos. Cuentanos si necesitas ajustar tu plan.`;
    } else {
      const url = `${window.location.origin}/pass/${member.qrAccessToken}`;
      text = `Hola! Aqui tienes tu carnet digital de acceso al gimnasio: ${url}`;
    }
    window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`, '_blank');
  };

  async function handleCreate(formData: FormData) {
    startTransition(async () => {
      const res = await createMember(formData);
      if (res.success) {
        showToast('Socio creado exitosamente.', 'success');
        setIsCreateModalOpen(false);
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
      const planName = plans.find(p => p.id === formData.get('planId'))?.name || 'Plan';
      showToast(`Plan "${planName}" renovado exitosamente.`, 'success');
      setRenewMember(null);
      window.location.reload();
    } else {
      showToast(res.error, 'error');
    }
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div onClick={() => setFilter('healthy')} className={`cursor-pointer p-6 rounded-2xl shadow-sm border transition-all ${filter === 'healthy' ? 'bg-green-50 border-green-200 ring-2 ring-green-500' : 'bg-white border-gray-100 hover:border-green-300'} flex items-center gap-4`}>
          <div className="bg-green-100 p-3 rounded-full text-green-600"><CheckCircle2 size={24} /></div>
          <div><p className="text-sm text-gray-500 font-bold uppercase">Saludables</p><p className="text-2xl font-black text-gray-800">{healthyCount}</p></div>
        </div>
        <div onClick={() => setFilter('risk')} className={`cursor-pointer p-6 rounded-2xl shadow-sm border transition-all ${filter === 'risk' ? 'bg-yellow-50 border-yellow-200 ring-2 ring-yellow-500' : 'bg-white border-gray-100 hover:border-yellow-300'} flex items-center gap-4`}>
          <div className="bg-yellow-100 p-3 rounded-full text-yellow-600"><AlertTriangle size={24} /></div>
          <div><p className="text-sm text-gray-500 font-bold uppercase">En Riesgo</p><p className="text-2xl font-black text-gray-800">{riskCount}</p></div>
        </div>
        <div onClick={() => setFilter('critical')} className={`cursor-pointer p-6 rounded-2xl shadow-sm border transition-all ${filter === 'critical' ? 'bg-red-50 border-red-200 ring-2 ring-red-500' : 'bg-white border-gray-100 hover:border-red-300'} flex items-center gap-4`}>
          <div className="bg-red-100 p-3 rounded-full text-red-600"><XOctagon size={24} /></div>
          <div><p className="text-sm text-gray-500 font-bold uppercase">Criticos</p><p className="text-2xl font-black text-gray-800">{criticalCount}</p></div>
        </div>
        <div className="bg-gray-900 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full text-white"><DollarSign size={24} /></div>
          <div><p className="text-sm text-gray-300 font-bold uppercase">Dinero en Riesgo</p><p className="text-2xl font-black text-white">${moneyAtRisk.toLocaleString('es-CO')}</p></div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Buscar socio..." className="pl-10 pr-4 py-2 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="border rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium text-gray-700">
            <option value="all">Todos los estados</option>
            <option value="healthy">🟢 Saludables</option>
            <option value="risk">🟡 En Riesgo</option>
            <option value="critical">🔴 Criticos</option>
            <option value="inactive">⚪ Inactivos</option>
          </select>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="text-sm font-semibold text-gray-500">Mostrando {filtered.length} {filtered.length === 1 ? 'socio' : 'socios'}</div>
          <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition whitespace-nowrap">
            <Plus className="h-5 w-5" /> Nuevo
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-600">Nombre</th>
              <th className="px-6 py-4 font-medium text-gray-600">Telefono</th>
              <th className="px-6 py-4 font-medium text-gray-600">Ultima Visita</th>
              <th className="px-6 py-4 font-medium text-gray-600">Plan / Vence</th>
              <th className="px-6 py-4 font-medium text-gray-600">Retencion</th>
              <th className="px-6 py-4 font-medium text-gray-600 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((member, index) => {
              const isInactive = !member.endDate || new Date(member.endDate) < new Date();
              let statusColor = member.churnStatus === 'healthy' ? 'bg-green-100 text-green-700' : member.churnStatus === 'risk' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-700';
              let statusText = member.churnStatus === 'healthy' ? 'Al dia' : member.churnStatus === 'risk' ? 'En Riesgo' : 'Critico';
              if (isInactive) { statusColor = 'bg-gray-100 text-gray-600'; statusText = 'Inactivo'; }

              return (
                <tr key={`${member.id}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"><User className="h-5 w-5" /></div>
                    <div><span className="font-bold text-gray-800 block">{member.fullName}</span><span className="text-xs text-gray-500">{member.documentId}</span></div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{member.phone}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {member.daysSinceLastAttendance === -1 ? 'Nunca' : member.daysSinceLastAttendance === 0 ? 'Hoy' : `Hace ${member.daysSinceLastAttendance}d`}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {member.planName ? (
                      <div>
                        <span className="font-medium text-gray-800 block">{member.planName}</span>
                        {member.endDate && <span className="text-xs text-gray-500">Vence: {new Date(member.endDate).toLocaleDateString('es-CO')}</span>}
                      </div>
                    ) : <span className="text-gray-400 text-sm">Sin plan</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`${statusColor} px-3 py-1 rounded-full text-xs font-bold`}>{statusText}</span>
                    {member.daysUntilExpiry > 0 && member.daysUntilExpiry <= 7 && (
                      <div className="text-xs text-gray-500 mt-1 font-semibold">Vence en {member.daysUntilExpiry}d</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setRenewMember(member)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition"
                        title="Renovar / Cobrar plan"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Renovar
                      </button>
                      <button
                        onClick={() => handleWhatsAppAction(member)}
                        disabled={!member.phone}
                        className={`p-2 rounded-full transition ${member.phone ? 'text-green-600 hover:bg-green-50' : 'text-gray-300 cursor-not-allowed'}`}
                        title={!member.phone ? 'Sin telefono registrado' : 'Contactar por WhatsApp'}
                      >
                        <MessageCircle className="h-6 w-6" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">No se encontraron miembros</td></tr>
            )}
          </tbody>
        </table></div>
      </div>

      {/* MODAL: Crear socio */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Registrar Nuevo Socio</h2>
              <button onClick={() => setIsCreateModalOpen(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <form action={handleCreate} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label><input name="fullName" required className="w-full border p-2 rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Cedula / Documento</label><input name="documentId" required className="w-full border p-2 rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label><input name="phone" required type="tel" className="w-full border p-2 rounded-lg" /></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Inicial (Opcional)</label>
                <select name="planId" className="w-full border p-2 rounded-lg">
                  <option value="">-- Sin plan --</option>
                  {plans.map(p => (<option key={p.id} value={p.id}>{p.name} - ${Number(p.price).toLocaleString('es-CO')}</option>))}
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg text-gray-600">Cancelar</button>
                <button type="submit" disabled={isPending} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-60">
                  {isPending ? 'Guardando...' : 'Guardar Socio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Renovar / Cobrar plan */}
      {renewMember && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold flex items-center gap-2"><RefreshCw className="text-blue-600 h-5 w-5" /> Renovar Plan</h2>
              <button onClick={() => setRenewMember(null)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Socio: <strong>{renewMember.fullName}</strong>
              {renewMember.planName && renewMember.endDate && (
                <span className="ml-2 text-yellow-600 font-medium">(Plan actual: {renewMember.planName} vence {new Date(renewMember.endDate).toLocaleDateString('es-CO')})</span>
              )}
            </p>
            <form
              action={async (formData) => {
                await handleRenew(formData);
              }}
              className="space-y-4"
            >
              <input type="hidden" name="memberId" value={renewMember.id} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo Plan *</label>
                <select name="planId" required className="w-full border-2 rounded-xl p-3 bg-white">
                  <option value="">-- Selecciona un plan --</option>
                  {plans.map(p => (<option key={p.id} value={p.id}>{p.name} · {p.durationDays}d · ${Number(p.price).toLocaleString('es-CO')}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metodo de Pago *</label>
                <select name="method" required className="w-full border-2 rounded-xl p-3 bg-white">
                  <option value="cash">Efectivo</option>
                  <option value="transfer">Transferencia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referencia (opcional)</label>
                <input name="referenceNumber" placeholder="Num. comprobante transferencia" className="w-full border-2 rounded-xl p-3" />
              </div>
              {coaches.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entrenador asignado (opcional)</label>
                  <select name="coachId" className="w-full border-2 rounded-xl p-3 bg-white">
                    <option value="">Sin entrenador</option>
                    {coaches.map((c: any) => (<option key={c.id} value={c.id}>{c.fullName}</option>))}
                  </select>
                </div>
              )}
              {renewMember.planName && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                  <strong>Nota:</strong> El plan activo actual sera reemplazado. El nuevo plan inicia hoy.
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setRenewMember(null)} className="flex-1 px-4 py-3 border rounded-xl text-gray-600">Cancelar</button>
                <button type="submit" disabled={isRenewing} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-60">
                  {isRenewing ? 'Procesando...' : 'Confirmar Renovacion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
