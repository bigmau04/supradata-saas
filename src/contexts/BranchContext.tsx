'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface BranchItem {
  id: string;
  name: string;
  address?: string;
  status: 'active' | 'inactive';
}

export const INITIAL_BRANCHES: BranchItem[] = [
  {
    id: 'branch-principal-norte',
    name: 'Sede Principal Norte',
    address: 'Calle 100 # 15-20, Zona Norte',
    status: 'active',
  },
  {
    id: 'branch-sur-express',
    name: 'Sede Sur Express',
    address: 'Av. Carrera 68 # 45-10, Zona Sur',
    status: 'active',
  },
];

interface BranchContextType {
  branches: BranchItem[];
  activeBranch: BranchItem;
  setActiveBranch: (branch: BranchItem) => void;
  selectBranchById: (id: string) => void;
  addBranch: (name: string, address?: string) => BranchItem;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [branches, setBranches] = useState<BranchItem[]>(INITIAL_BRANCHES);
  const [activeBranch, setActiveBranchState] = useState<BranchItem>(INITIAL_BRANCHES[0]);

  useEffect(() => {
    try {
      const savedBranches = localStorage.getItem('supradata_branches');
      if (savedBranches) {
        const parsed = JSON.parse(savedBranches);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBranches(parsed);
          const savedActiveId = localStorage.getItem('supradata_active_branch_id');
          const found = parsed.find((b: BranchItem) => b.id === savedActiveId);
          if (found) {
            setActiveBranchState(found);
            return;
          }
          setActiveBranchState(parsed[0]);
          return;
        }
      }

      const savedActiveId = localStorage.getItem('supradata_active_branch_id');
      if (savedActiveId) {
        const found = INITIAL_BRANCHES.find((b) => b.id === savedActiveId);
        if (found) {
          setActiveBranchState(found);
        }
      }
    } catch {
      // LocalStorage access fallback
    }
  }, []);

  const setActiveBranch = (branch: BranchItem) => {
    setActiveBranchState(branch);
    try {
      localStorage.setItem('supradata_active_branch_id', branch.id);
    } catch {
      // ignore
    }
  };

  const selectBranchById = (id: string) => {
    const branch = branches.find((b) => b.id === id);
    if (branch) {
      setActiveBranch(branch);
    }
  };

  const addBranch = (name: string, address?: string): BranchItem => {
    const newBranch: BranchItem = {
      id: `branch-${Date.now()}`,
      name: name.trim(),
      address: address?.trim() || '',
      status: 'active',
    };
    const updated = [...branches, newBranch];
    setBranches(updated);
    setActiveBranch(newBranch);
    try {
      localStorage.setItem('supradata_branches', JSON.stringify(updated));
    } catch {
      // ignore
    }
    return newBranch;
  };

  return (
    <BranchContext.Provider
      value={{
        branches,
        activeBranch,
        setActiveBranch,
        selectBranchById,
        addBranch,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch debe ser utilizado dentro de un BranchProvider');
  }
  return context;
}
