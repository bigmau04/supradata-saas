'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useBranch, BranchItem } from '@/contexts/BranchContext';

export function BranchSelector() {
  const { branches, activeBranch, setActiveBranch, addBranch } = useBranch();
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatButtonText = (branch: BranchItem) => {
    const clean = branch.name.replace(/^sede\s+/i, '').trim().toUpperCase();
    return `SEDE: ${clean} [ ▼ ]`;
  };

  const handleSelectBranch = (branch: BranchItem) => {
    setActiveBranch(branch);
    setIsOpen(false);
  };

  const handleOpenAddModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setShowAddModal(true);
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    addBranch(newBranchName, newBranchAddress);
    setNewBranchName('');
    setNewBranchAddress('');
    setShowAddModal(false);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className="bg-white/80 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
        >
          {formatButtonText(activeBranch)}
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl rounded-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Sedes Disponibles
            </div>

            <div className="space-y-0.5">
              {branches.map((branch) => {
                const isCurrent = branch.id === activeBranch.id;
                return (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => handleSelectBranch(branch)}
                    className={`w-full text-left text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 p-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                      isCurrent ? 'bg-blue-50/80 text-blue-700 font-semibold' : ''
                    }`}
                  >
                    <span className="truncate">{branch.name}</span>
                    {isCurrent && (
                      <span className="text-[10px] text-blue-600 font-bold ml-1 shrink-0">
                        [ ACTIVA ]
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-slate-100 mt-1 pt-1">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="w-full text-left text-xs font-bold text-blue-600 hover:bg-blue-50 hover:text-blue-800 p-2 rounded-lg cursor-pointer transition-colors"
              >
                [ + AÑADIR NUEVA SEDE ]
              </button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">NUEVA SEDE</h3>
                <p className="text-[11px] text-slate-500">Registrar una sede para tu organización</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1 rounded cursor-pointer"
              >
                [ X ]
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-600 mb-1">
                  Nombre de la Sede *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Sede Poblado Centro"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-600 mb-1">
                  Dirección (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="ej. Carrera 43A # 1-50"
                  value={newBranchAddress}
                  onChange={(e) => setNewBranchAddress(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs font-semibold text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                >
                  [ CANCELAR ]
                </button>
                <button
                  type="submit"
                  className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer transition-colors"
                >
                  [ + GUARDAR SEDE ]
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
