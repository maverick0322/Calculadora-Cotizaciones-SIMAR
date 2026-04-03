import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { QuoteSummary } from 'src/shared/types/Quote';

export const useDrafts = () => {
  const [drafts, setDrafts] = useState<QuoteSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const response = await window.api.getDrafts();
        if (response.success) {
          setDrafts(response.data || []);
        } else {
          toast.error('Error al cargar la base de datos');
        }
      } catch (error) {
        console.error('Error IPC:', error);
        toast.error('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, []);

  return { drafts, loading };
};