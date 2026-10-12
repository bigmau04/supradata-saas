'use client';

import React, { useState } from 'react';
import { renewMemberPlan } from '@/app/actions/members';
import {
  CreditCard,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  AlertTriangle,
  X,
  MessageCircle,
} from 'lucide-react';

export interface RenewMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any;
  plans: any[];
  coaches?: any[];
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function RenewMemberModal({
  isOpen,
  onClose,
  member,
  plans,
  coaches = [],
  onSuccess,
  onError,
}: RenewMemberModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    member?.planId || plans[0]?.id || ''
  );
  const [method, setMethod] = useState<'cash' | 'transfer'>('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [coachId, setCoachId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !member) return null;

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
  const isExpired = !member.endDate || new Date(member.endDate) < new Date();

  // Calcular nueva fecha estimada de fin
  const getProjectedEndDate = () => {
    if (!selectedPlan?.durationDays) return null;
    const now = new Date();
    const projected = new Date(now.getFullYear(), now.getMonth(), now.getDate() + selectedPlan.durationDays);
    return projected.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPlanId) {
      onError?.('Debes seleccionar un plan comercial.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('memberId', member.id);
      formData.append('planId', selectedPlanId);
      formData.append('method', method);
      if (referenceNumber) formData.append('referenceNumber', referenceNumber.trim());
      if (coachId) formData.append('coachId', coachId);

      const res = await renewMemberPlan(formData);
      setIsSubmitting(false);

      if (res.success) {
        onSuccess?.(`Pago registrado y membresía de ${member.fullName} renovada con éxito.`);
        onClose();
      } else {
        onError?.(res.error || 'Ocurrió un error al procesar el cobro.');
      }
    } catch {
      setIsSubmitting(false);
      onError?.('Error de comunicación con el servidor.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-lg max-h-[90dvh] overflow-y-auto">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-slate-700" />
              Cobro y Renovación de Membresía
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Registra el cobro en mostrador y renueva la vigencia del socio
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Bloque 1: PLAN ACTUAL DEL SOCIO */}
        <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Socio Identificado
              </span>
              <p className="text-sm font-bold text-slate-900 truncate">{member.fullName}</p>
              <p className="text-xs text-slate-500">ID / Cédula: {member.documentId}</p>
            </div>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                isExpired
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {isExpired ? (
                <>
                  <AlertTriangle className="h-3 w-3" /> Vencido
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3" /> Activo
                </>
              )}
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Plan Actual:</span>
              <span className="font-semibold text-slate-800">
                {member.planName || 'Sin plan asignado'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Vencimiento Registrado:</span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {member.endDate
                  ? new Date(member.endDate).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'No disponible'}
              </span>
            </div>
          </div>
        </div>

        {/* Formulario de Cobro y Renovación */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Bloque 2: SELECCIÓN DEL PLAN (NUEVO O MANTENER ACTUAL) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Seleccionar Plan Comercial a Cobrar *
            </label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none bg-white font-medium"
            >
              {plans.map((p) => {
                const isCurrent = p.id === member.planId;
                return (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.durationDays} días) — ${Number(p.price).toLocaleString('es-CO')}
                    {isCurrent ? ' [Plan Actual]' : ''}
                  </option>
                );
              })}
            </select>

            {selectedPlan && (
              <div className="mt-2 p-2.5 bg-blue-50/60 border border-blue-200/60 rounded-lg flex items-center justify-between text-xs text-blue-900">
                <span>
                  Nueva vigencia calculada (+{selectedPlan.durationDays} días):
                </span>
                <span className="font-bold tabular-nums">
                  Hasta {getProjectedEndDate()}
                </span>
              </div>
            )}
          </div>

          {/* Bloque 3: MÉTODO DE PAGO Y MONTO */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Total a Cobrar:</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                ${Number(selectedPlan?.price || 0).toLocaleString('es-CO')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
              <button
                type="button"
                onClick={() => setMethod('cash')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition flex items-center justify-center gap-1.5 ${
                  method === 'cash'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('transfer')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition flex items-center justify-center gap-1.5 ${
                  method === 'transfer'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Transferencia</span>
              </button>
            </div>

            {method === 'transfer' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Número de Referencia / Comprobante Bancario *
                </label>
                <input
                  type="text"
                  required
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="ej. Transf. Nequi / Bancolombia #123456"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>
            )}
          </div>

          {/* Entrenador Asignado (Opcional) */}
          {coaches.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Entrenador Responsable (Comisión opcional)
              </label>
              <select
                value={coachId}
                onChange={(e) => setCoachId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none bg-white font-medium"
              >
                <option value="">Sin entrenador comisionable</option>
                {coaches.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2 px-3 text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? 'Registrando Pago...' : 'Registrar Cobro y Renovar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
