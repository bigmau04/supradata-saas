'use client';

import { useState } from 'react';
import { createProduct, toggleProductStatus, updateProduct } from '@/app/actions/products';
import { ShoppingCart, Plus, X, Pencil, AlertTriangle, CheckCircle } from 'lucide-react';

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  return (
    <div className={`fixed top-4 right-4 z-[100] max-w-sm w-full shadow-2xl rounded-2xl p-4 flex items-start gap-3 border transition-all ${
      type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'
    }`}>
      {type === 'error'
        ? <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        : <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
      }
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
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
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={20} /> Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Producto</th>
              <th className="p-4 font-semibold text-gray-600">Precio</th>
              <th className="p-4 font-semibold text-gray-600">Estado</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium flex items-center gap-2">
                  <ShoppingCart size={18} className="text-gray-400" />
                  {p.name}
                </td>
                <td className="p-4">${Number(p.price).toLocaleString('es-CO')}</td>
                <td className="p-4">
                  {p.isActive
                    ? <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Activo</span>
                    : <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Inactivo</span>}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => setEditProduct(p)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-bold transition"
                    >
                      <Pencil size={13} /> Editar
                    </button>
                    <button onClick={() => handleToggle(p.id, p.isActive)} className="text-sm font-medium text-blue-600 hover:underline">
                      {p.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={4} className="text-center py-8 text-gray-500">No hay productos registrados.</td></tr>
            )}
          </tbody>
        </table></div>
      </div>

      {/* MODAL: Crear producto */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 sm:p-6 relative max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">Nuevo Producto</h2>
              <button onClick={() => setShowCreateModal(false)}><X size={24} className="text-gray-400 hover:text-gray-800" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre (ej. Agua Cristal)</label>
                <input name="name" required className="w-full border p-2 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                <input name="price" type="number" min="0" step="100" required className="w-full border p-2 rounded-lg" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition mt-4 disabled:opacity-60">
                {loading ? 'Guardando...' : 'Crear Producto'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Editar producto */}
      {editProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 sm:p-6 relative max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">Editar Producto</h2>
              <button onClick={() => setEditProduct(null)}><X size={24} className="text-gray-400 hover:text-gray-800" /></button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <input type="hidden" name="id" value={editProduct.id} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input name="name" required defaultValue={editProduct.name} className="w-full border p-2 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Venta ($)</label>
                <input name="price" type="number" min="0" step="100" required defaultValue={Number(editProduct.price)} className="w-full border p-2 rounded-lg" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditProduct(null)} className="flex-1 px-4 py-2 border rounded-lg text-gray-600">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-60">
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
