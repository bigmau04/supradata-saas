'use client';

import { useState } from 'react';
import { createProduct, toggleProductStatus, updateProduct } from '@/app/actions/products';
import { ShoppingCart, Plus, X, Pencil, AlertTriangle, CheckCircle, Power } from 'lucide-react';

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
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600 shrink-0">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ProductsClient({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await createProduct(formData);
      if (res?.success) {
        showToast('Producto creado exitosamente.', 'success');
        setShowCreateModal(false);
        window.location.reload();
      } else {
        showToast(res?.message || 'Error al crear el producto.', 'error');
      }
    } catch {
      showToast('Error inesperado al crear el producto.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await updateProduct(formData);
      if (res?.success) {
        showToast('Producto actualizado exitosamente.', 'success');
        setEditProduct(null);
        window.location.reload();
      } else {
        showToast(res?.message || 'Error al actualizar el producto.', 'error');
      }
    } catch {
      showToast('Error inesperado al actualizar el producto.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleProductStatus(id, !currentStatus);
      window.location.reload();
    } catch {
      showToast('Error al cambiar el estado del producto.', 'error');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Gestión de Tienda</h1>
          <p className="text-xs text-slate-500">
            Inventario de bebidas, suplementos y productos de venta en mostrador
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3 px-4 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">Precio de Venta</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200/60">
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">
                    ${Number(p.price).toLocaleString('es-CO')}
                  </td>
                  <td className="py-3 px-4">
                    {p.isActive ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-medium px-2 py-0.5 rounded-full">
                        Activo
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 border border-slate-200/60 text-xs font-medium px-2 py-0.5 rounded-full">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditProduct(p)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
                        title="Editar producto"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggle(p.id, p.isActive)}
                        className={`p-1.5 rounded-md transition ${
                          p.isActive
                            ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={p.isActive ? 'Desactivar producto' : 'Activar producto'}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 px-4 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center justify-center">
                      <div className="h-10 w-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center mb-3 border border-slate-200/80">
                        <ShoppingCart className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Aún no tienes productos en inventario
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 mb-4">
                        Crea productos para venta rápida en recepción (bebidas hidratantes, barras de proteína, agua).
                      </p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3.5 rounded-lg transition"
                      >
                        + Registrar Primer Producto
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Crear Producto */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 w-full max-w-md max-h-[90dvh] overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-900">Nuevo Producto de Mostrador</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  name="name"
                  required
                  placeholder="Ej. Bebida Energética 500ml"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Precio de Venta ($) *
                </label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="100"
                  required
                  placeholder="4000"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none tabular-nums font-semibold"
                />
              </div>
              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-60 transition shadow-2xs"
                >
                  {loading ? 'Guardando...' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Editar Producto */}
      {editProduct && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 w-full max-w-md max-h-[90dvh] overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-900">Editar Producto</h2>
              <button onClick={() => setEditProduct(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="space-y-3.5">
              <input type="hidden" name="id" value={editProduct.id} />
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  name="name"
                  required
                  defaultValue={editProduct.name}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Precio de Venta ($) *
                </label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="100"
                  required
                  defaultValue={Number(editProduct.price)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none tabular-nums font-semibold"
                />
              </div>
              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setEditProduct(null)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-60 transition shadow-2xs"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
