import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User } from '../../../../../shared/types/Auth';

export type LoginFormValues = {
  email: string;
  password: string;
};

export const useLoginForm = (onLoginSuccess: (user: User) => void) => {
  const form = useForm<LoginFormValues>();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const submitLogin = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await window.api.login(data);

      if (response.success && response.data) {
        onLoginSuccess(response.data);
      } else {
        setErrorMsg(response.error || 'Correo o contraseña incorrectos.');
      }
    } catch {
      setErrorMsg('Error de conexión con la base de datos local.');
    } finally {
      setIsLoading(false);
    }
  };

  return { form, submitLogin, errorMsg, isLoading };
};
