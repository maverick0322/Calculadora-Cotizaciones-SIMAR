import { useState, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { QuoteFormValues } from '../../../../../shared/schemas/quoteSchema';

export const useLocationAutocomplete = (serviceIndex: number) => {
  const { control, setValue } = useFormContext<QuoteFormValues>();

  const [states, setStates] = useState<string[]>([]);
  const [municipalities, setMunicipalities] = useState<string[]>([]);
  const [colonies, setColonies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 👇 Rutas dinámicas correctas para observar solo este servicio
  const cp = useWatch({ control, name: `services.${serviceIndex}.location.cp` as any }); 
  const currentState = useWatch({ control, name: `services.${serviceIndex}.location.state` as any });
  const currentMunicipality = useWatch({ control, name: `services.${serviceIndex}.location.municipality` as any });

  // Carga inicial de Estados
  useEffect(() => {
    window.api.getLocations('states').then(res => {
      if (res.success) setStates(res.data);
    });
  }, []);

  // Autocompletado maestro por CP
  useEffect(() => {
    if (cp && cp.length === 5) {
      setIsLoading(true);
      window.api.getLocations('byCP', { cp }).then(res => {
        if (res.success && res.data.length > 0) {
          const location = res.data[0];
          
          setValue(`services.${serviceIndex}.location.state` as any, location.state, { shouldValidate: true });
          setValue(`services.${serviceIndex}.location.municipality` as any, location.municipality, { shouldValidate: true });

          const cpColonies = res.data.map((d: any) => d.colony);
          setColonies(cpColonies);

          window.api.getLocations('municipalities', { state: location.state }).then(mRes => {
            if (mRes.success) setMunicipalities(mRes.data);
          });
        }
        setIsLoading(false);
      });
    }
  }, [cp, serviceIndex, setValue]);

  // Si cambia el Estado manualmente, trae sus municipios
  useEffect(() => {
    if (currentState) {
      window.api.getLocations('municipalities', { state: currentState }).then(res => {
        if (res.success) setMunicipalities(res.data);
      });
    } else {
      setMunicipalities([]);
      setColonies([]);
    }
  }, [currentState]);

  // Si cambian Estado y Municipio (sin CP), trae las colonias
  useEffect(() => {
    if (currentState && currentMunicipality && (!cp || cp.length !== 5)) {
      window.api.getLocations('colonies', { state: currentState, municipality: currentMunicipality }).then(res => {
        if (res.success) setColonies(res.data);
      });
    }
  }, [currentState, currentMunicipality, cp]);

  // Guarda una nueva colonia si no existe en BD
  const saveCustomColony = async (newColonyName: string) => {
    if (!currentState || !currentMunicipality || !newColonyName) return false;
    
    const result = await window.api.addCustomLocation({
      cp: cp,
      state: currentState,
      municipality: currentMunicipality,
      colony: newColonyName
    });

    if (result.success) {
      const res = await window.api.getLocations('colonies', { state: currentState, municipality: currentMunicipality });
      if (res.success) setColonies(res.data);
      
      setValue(`services.${serviceIndex}.location.neighborhood` as any, newColonyName.toUpperCase(), { shouldValidate: true });
      return true;
    }
    return false;
  };

  return {
    states,
    municipalities,
    colonies,
    isLoading,
    saveCustomColony,
    isMunicipalityDisabled: !currentState,
    isColonyDisabled: !currentMunicipality
  };
};