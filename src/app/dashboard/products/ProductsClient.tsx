'use client';

import { useState } from 'react';
import { createProduct, toggleProductStatus } from '@/app/actions/products';
import { ShoppingCart, Plus, X } from 'lucide-react';

export function ProductsClient({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createProduct(formData);
    if (res?.success) window.location.reload();
    setLoading(false);
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    await toggleProductStatus(id, !currentStatus);
    window.location.reload();
  };

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={20} /> Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Producto</th>
              <th className="p-4 font-semibold text-gray-600">Precio</th>
              <th className="p-4 font-semibold text-gray-600">Estado</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Acción</th>
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
                  {p.isActive ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Activo</span>
                  ) : (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Inactivo</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleToggle(p.id, p.isActive)} className="text-sm font-medium text-blue-600 hover:underline">
                    {p.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X size={24} /></button>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Nuevo Producto</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre (ej. Agua Cristal)</label>
                <input name="name" required className="w-full border p-2 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                <input name="price" type="number" required className="w-full border p-2 rounded-lg" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition mt-4">
                {loading ? 'Guardando...' : 'Crear Producto'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
