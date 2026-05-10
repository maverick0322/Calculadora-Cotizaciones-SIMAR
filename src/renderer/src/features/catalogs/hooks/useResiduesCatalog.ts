import { useState, useEffect, useCallback } from 'react';

export interface Residue {
  id: number;
  name: string;
  residue_type: string;
  classification?: string
  clave?: string
  unit: string;
  base_price: number;
}

export const useResiduesCatalog = () => {
  const [residues, setResidues] = useState<Residue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResidues = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await window.api.manageResidues('get');
      if (response.success) {
        setResidues(response.data);
        setError(null);
      } else {
        setError(response.error || 'Error al cargar los residuos');
      }
    } catch (err) {
      setError('Error de conexión al obtener los residuos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResidues();
  }, [fetchResidues]);

  const addResidue = async (data: Omit<Residue, 'id'>) => {
    const response = await window.api.manageResidues('add', data);
    if (response.success) {
      await fetchResidues();
      return true;
    }
    setError(response.error);
    return false;
  };

  const deleteResidue = async (id: number) => {
    const response = await window.api.manageResidues('delete', { id });
    if (response.success) {
      await fetchResidues();
      return true;
    }
    setError(response.error);
    return false;
  };

  const updatePrice = async (id: number, newPrice: number) => {
    const response = await window.api.manageResidues('updatePrice', { id, newPrice });
    if (response.success) {
      await fetchResidues();
      return true;
    }
    setError(response.error);
    return false;
  };

  return {
    residues,
    isLoading,
    error,
    addResidue,
    deleteResidue,
    updatePrice
  };
};