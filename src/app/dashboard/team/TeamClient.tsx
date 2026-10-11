'use client';

import { useState } from 'react';
import { createStaffUser } from '@/app/actions/team';
import { UserPlus, Shield, User, X } from 'lucide-react';

export function TeamClient({ initialMembers }: { initialMembers: any[] }) {
  const [members, setMembers] = useState(initialMembers);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await createStaffUser(formData);

    if (res?.success === false) {
      setError(res.message);
      setLoading(false);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Equipo y Personal</h1>
          <p className="text-xs text-slate-500">
            Administración de cuentas con acceso al sistema y roles de seguridad
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3 px-4 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Correo Electrónico</th>
                <th className="py-3 px-4">Rol Asignado</th>
                <th className="py-3 px-4 text-right">Fecha Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200/60">
                        {m.fullName
                          ?.split(' ')
                          .map((n: string) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </div>
                      <span>{m.fullName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-600">{m.email}</td>
                  <td className="py-3 px-4">
                    {m.role === 'owner' ? (
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-200/80 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        <Shield className="h-3 w-3 text-slate-700" /> Administrador
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        <User className="h-3 w-3 text-emerald-600" /> Recepción
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400 tabular-nums text-right">
                    {new Date(m.createdAt).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Nuevo Usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 w-full max-w-md max-h-[90dvh] overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-900">Nuevo Miembro del Personal</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  name="fullName"
                  required
                  placeholder="Ej. Laura González"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="laura@gimnasio.com"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Contraseña Inicial *
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Rol de Acceso *</label>
                <select
                  name="role"
                  required
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none bg-white font-medium"
                >
                  <option value="receptionist">Recepcionista (Operación mostrador)</option>
                  <option value="owner">Administrador (Control total)</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-60 transition shadow-2xs"
                >
                  {loading ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
