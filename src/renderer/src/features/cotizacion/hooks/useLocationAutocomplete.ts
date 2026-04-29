import { useState, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { QuoteFormValues } from '../../../../../shared/schemas/quoteSchema';

export const useLocationAutocomplete = (serviceIndex: number) => {
  const { control, setValue } = useFormContext<QuoteFormValues>();

  const [states, setStates] = useState<string[]>([]);
  const [municipalities, setMunicipalities] = useState<string[]>([]);
  const [colonies, setColonies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cp = useWatch({ control, name: `services.${serviceIndex}.location.cp` as any }); 
  const currentState = useWatch({ control, name: `services.${serviceIndex}.location.state` as const });
  const currentMunicipality = useWatch({ control, name: `services.${serviceIndex}.location.municipality` as const });

  useEffect(() => {
    window.api.getLocations('states').then(res => {
      if (res.success) setStates(res.data);
    });
  }, []);

  useEffect(() => {
    if (cp && cp.length === 5) {
      setIsLoading(true);
      window.api.getLocations('byCP', { cp }).then(res => {
        if (res.success && res.data.length > 0) {
          const location = res.data[0];
          
          setValue(`services.${serviceIndex}.location.state` as const, location.state, { shouldValidate: true });
          setValue(`services.${serviceIndex}.location.municipality` as const, location.municipality, { shouldValidate: true });

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

  useEffect(() => {
    if (currentState && currentMunicipality && (!cp || cp.length !== 5)) {
      window.api.getLocations('colonies', { state: currentState, municipality: currentMunicipality }).then(res => {
        if (res.success) setColonies(res.data);
      });
    }
  }, [currentState, currentMunicipality, cp]);

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
      
      setValue(`services.${serviceIndex}.location.neighborhood` as const, newColonyName.toUpperCase(), { shouldValidate: true });
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