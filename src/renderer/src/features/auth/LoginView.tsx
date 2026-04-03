import logoImg from '../../assets/logo.png'; 
import { useLoginForm } from '../cotizacion/hooks/useLoginForm';

export const LoginView = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
  const { form, submitLogin, errorMsg, isLoading } = useLoginForm(onLoginSuccess);
  const { register, handleSubmit } = form;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">

        <div className="text-center mb-8">
          <img src={logoImg} alt="SIMAR Logo" className="w-24 h-auto mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
          <p className="text-sm text-gray-500 mt-2">Ingresa tus credenciales para acceder al sistema</p>
        </div>

        <form onSubmit={handleSubmit(submitLogin)} className="space-y-6">

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

          {errorMsg && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
              {errorMsg}
            </div>
          )}

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