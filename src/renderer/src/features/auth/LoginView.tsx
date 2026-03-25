import { JSX, useState } from 'react';
import { useForm } from 'react-hook-form';
import logoImg from '../../assets/logo.png'; // Ajusta la ruta si es necesario

// Definimos qué datos va a recibir nuestro formulario
type LoginFormValues = {
  email: string;
  password: string;
};

export const LoginView = ({ onLoginSuccess }: { onLoginSuccess: () => void }): JSX.Element => {
  const { register, handleSubmit } = useForm<LoginFormValues>();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // LA LÓGICA CONECTADA AL BACKEND
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Llamamos al guardia que conectaste en el backend
      const response = await window.api.login(data);

      if (response.success && response.data) {
        // ¡Las credenciales son correctas!
        console.log("¡Bienvenido!", response.data.full_name);

        // Le avisamos a App.tsx que quite el candado y muestre el sistema
        onLoginSuccess();
      } else {
        // El guardia dijo que no (contraseña incorrecta, usuario no existe, etc.)
        setErrorMsg(response.error || 'Correo o contraseña incorrectos.');
      }
    } catch (error) {
      console.error('Error IPC:', error);
      setErrorMsg('Error de conexión con la base de datos local.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">

        {/* Cabecera y Logo */}
        <div className="text-center mb-8">
          <img src={logoImg} alt="SIMAR Logo" className="w-24 h-auto mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
          <p className="text-sm text-gray-500 mt-2">Ingresa tus credenciales para acceder al sistema</p>
        </div>

        {/* Formulario Limpio */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              {...register('email', { required: true })}
              placeholder="admin@simar.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              {...register('password', { required: true })}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          {/* Espacio reservado para el mensaje de error (ROJO) */}
          {errorMsg && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
              {errorMsg}
            </div>
          )}

          {/* Botón de Acción */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex justify-center items-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Ingresar'
            )}
          </button>

        </form>
      </div>
    </div>
  );
};
