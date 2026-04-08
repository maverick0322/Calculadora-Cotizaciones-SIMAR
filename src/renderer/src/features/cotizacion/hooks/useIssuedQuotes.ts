import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { QuoteSummary } from 'src/shared/types/Quote';

export const useIssuedQuotes = () => {
  const [issuedQuotes, setIssuedQuotes] = useState<QuoteSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchIssuedQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await window.api.getIssuedQuotes() as any;
      
      if (response.success) {
        setIssuedQuotes(response.data || []);
      } else {
        toast.error('Error al cargar el historial de cotizaciones');
      }
    } catch (error) {
      console.error('Error IPC:', error);
      toast.error('Error de conexión con la base de datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssuedQuotes();
  }, [fetchIssuedQuotes]);

  return { issuedQuotes, loading, fetchIssuedQuotes };
};