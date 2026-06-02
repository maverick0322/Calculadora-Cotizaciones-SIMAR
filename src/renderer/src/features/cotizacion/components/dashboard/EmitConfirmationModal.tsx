import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, FileText, Loader2, Plus, X } from 'lucide-react';
import { User } from '../../../../../../shared/types/Auth';
import {
  ConditionType,
  IssueQuoteRequest,
  QuoteCondition,
  QuoteConditionSelection
} from '../../../../../../shared/types/Quote';

interface EmitConfirmationModalProps {
  isOpen: boolean;
  quoteId: number | null;
  currentUser: User;
  onCancel: () => void;
  onConfirm: (payload: IssueQuoteRequest) => void;
}

const buildInitials = (user: User): string => {
  const preferredValue = user.initials || user.employee_key || user.full_name;
  const initials = preferredValue
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 6);

  return initials || 'SIMAR';
};

const splitCustomConditions = (type: ConditionType, value: string): QuoteConditionSelection[] =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((description, index) => ({
      type,
      title: type === 'commercial' ? `Condición comercial especial ${index + 1}` : `Condición técnica especial ${index + 1}`,
      description,
      isCustom: true
    }));

export const EmitConfirmationModal = ({
  isOpen,
  quoteId,
  currentUser,
  onCancel,
  onConfirm
}: EmitConfirmationModalProps) => {
  const [folio, setFolio] = useState('');
  const [quoteTypeCode, setQuoteTypeCode] = useState<IssueQuoteRequest['quoteTypeCode']>('MR');
  const [conditions, setConditions] = useState<QuoteCondition[]>([]);
  const [selectedConditionIds, setSelectedConditionIds] = useState<Set<number>>(new Set());
  const [customCommercialConditions, setCustomCommercialConditions] = useState('');
  const [customTechnicalConditions, setCustomTechnicalConditions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preparedByInitials = useMemo(() => buildInitials(currentUser), [currentUser]);

  useEffect(() => {
    if (!isOpen || !quoteId) return;

    let isMounted = true;
    const loadEmissionData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [suggestionResponse, quoteData] = await Promise.all([
          window.api.suggestQuoteFolio({ quoteId, preparedByInitials }),
          window.api.getQuoteById(quoteId)
        ]);

        if (!suggestionResponse.success || !suggestionResponse.data) {
          throw new Error(suggestionResponse.error || 'No se pudo sugerir el folio.');
        }

        const serviceTypes = quoteData?.services.map((service) => service.serviceType) ?? [];
        const conditionResponse = await window.api.manageConditions('list', { serviceTypes });

        if (!conditionResponse.success || !conditionResponse.data) {
          throw new Error(conditionResponse.error || 'No se pudieron cargar las condiciones.');
        }

        if (!isMounted) return;
        setFolio(suggestionResponse.data.folio);
        setQuoteTypeCode(suggestionResponse.data.quoteTypeCode);
        setConditions(conditionResponse.data);
        setSelectedConditionIds(
          new Set(conditionResponse.data.filter((condition) => condition.type === 'commercial').map((condition) => condition.id))
        );
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError instanceof Error ? loadError.message : 'Error al preparar la emisión.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadEmissionData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, preparedByInitials, quoteId]);

  if (!isOpen || !quoteId) return null;

  const selectedCatalogConditions: QuoteConditionSelection[] = conditions
    .filter((condition) => selectedConditionIds.has(condition.id))
    .map((condition) => ({
      conditionId: condition.id,
      type: condition.type,
      title: condition.title,
      description: condition.description,
      isCustom: false
    }));

  const handleConditionToggle = (conditionId: number) => {
    setSelectedConditionIds((current) => {
      const next = new Set(current);
      if (next.has(conditionId)) {
        next.delete(conditionId);
        return next;
      }

      next.add(conditionId);
      return next;
    });
  };

  const handleConfirm = () => {
    const cleanFolio = folio.trim().toUpperCase();
    if (!cleanFolio) {
      setError('El folio es obligatorio para emitir.');
      return;
    }

    onConfirm({
      quoteId,
      folio: cleanFolio,
      preparedByUserId: currentUser.id,
      preparedByInitials,
      quoteTypeCode,
      conditions: [
        ...selectedCatalogConditions,
        ...splitCustomConditions('commercial', customCommercialConditions),
        ...splitCustomConditions('technical', customTechnicalConditions)
      ]
    });
  };

  const renderConditionGroup = (type: ConditionType, title: string) => {
    const filteredConditions = conditions.filter((condition) => condition.type === type);
    if (filteredConditions.length === 0) return null;

    return (
      <section>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">{title}</h4>
        <div className="space-y-2">
          {filteredConditions.map((condition) => (
            <label key={condition.id} className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
              <input
                type="checkbox"
                checked={selectedConditionIds.has(condition.id)}
                onChange={() => handleConditionToggle(condition.id)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                <span className="block text-sm font-medium text-gray-900">{condition.title}</span>
                <span className="block text-xs text-gray-500">{condition.description}</span>
              </span>
            </label>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="bg-blue-50 p-3 rounded-full text-blue-600 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">¿Emitir cotización oficial?</h3>
              <p className="text-sm text-gray-500 mt-1">
                Revisa el folio sugerido y selecciona las condiciones que se anexarán al PDF.
              </p>
            </div>
          </div>
          <button type="button" onClick={onCancel} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-150px)] space-y-5">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 py-12 text-sm text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Preparando datos de emisión...
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="quote-folio" className="block text-sm font-semibold text-gray-800 mb-2">
                  ¿Deseas guardar esta cotización como?
                </label>
                <input
                  id="quote-folio"
                  value={folio}
                  onChange={(event) => setFolio(event.target.value.toUpperCase())}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-mono text-sm uppercase tracking-wide focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Elaboró: <span className="font-semibold text-gray-700">{preparedByInitials}</span>
                </p>
              </div>

              {renderConditionGroup('commercial', 'Condiciones comerciales')}
              {renderConditionGroup('technical', 'Condiciones técnicas')}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                    <Plus className="h-4 w-4" />
                    Comercial especial
                  </span>
                  <textarea
                    value={customCommercialConditions}
                    onChange={(event) => setCustomCommercialConditions(event.target.value)}
                    className="h-24 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Una condición por línea"
                  />
                </label>
                <label className="block">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                    <Plus className="h-4 w-4" />
                    Técnica especial
                  </span>
                  <textarea
                    value={customTechnicalConditions}
                    onChange={(event) => setCustomTechnicalConditions(event.target.value)}
                    className="h-24 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Una condición por línea"
                  />
                </label>
              </div>

              {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:bg-blue-300"
          >
            <FileText className="w-4 h-4" />
            Emitir PDF
          </button>
        </div>
      </div>
    </div>
  );
};
