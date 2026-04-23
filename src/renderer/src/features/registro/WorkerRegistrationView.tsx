import { useState } from 'react';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';


interface WorkerRegistrationProps {
  onBack: () => void;
}

export default function WorkerRegistrationView({ onBack }: WorkerRegistrationProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estado inicial del formulario
  const [formData, setFormData] = useState({
    central_id: '',
    full_name: '',
    email: '',
    password: '',
    role: 'sales' as const,
    is_active: true
  });

  /**
   * Maneja los cambios en los inputs del formulario.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Limpia el mensaje de error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Realiza validaciones básicas de frontend antes de enviar al Main Process.
   */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.central_id.trim()) {
      newErrors.central_id = 'El ID central es requerido';
    }
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre completo es requerido';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const toastId = toast.loading('Registrando empleado...');
      try {
        const cleanEmail = formData.email.trim().toLowerCase();

        const response = await window.api.registerWorker({
          fullName: formData.full_name.trim(),
          employeeId: formData.central_id.trim(),
          email: cleanEmail,
          password: formData.password, 
          role: 'sales'
        });

        if (response.success) {
          toast.success('Empleado registrado exitosamente', { id: toastId });
          handleCancel();
        } else {
          toast.error(response.error || 'Error al registrar', { id: toastId });
        }
      } catch (error) {
        console.error('Error de comunicación con el sistema:', error);
        toast.error('Hubo un fallo crítico al intentar registrar al empleado.', { id: toastId });
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      central_id: '',
      full_name: '',
      email: '',
      password: '',
      role: 'sales',
      is_active: true
    });
    setErrors({});
    onBack(); // Regresa al Login o Dashboard según App.tsx
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md">

        {/* Encabezado del Módulo */}
        <div className="border-b border-gray-200 px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <UserPlus className="w-6 h-6 text-gray-700" />
            <h1 className="text-2xl font-bold text-gray-900">
              Registrar Nuevo Empleado
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Ingresa los datos personales y de acceso para el módulo de ventas de SIMAR.
          </p>
        </div>

        {/* Formulario de Registro */}
        <form onSubmit={handleSubmit} className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ID Central / EmployeeId */}
            <div>
              <label htmlFor="central_id" className="block text-sm font-medium text-gray-700 mb-2">
                ID Central
              </label>
              <input
                type="text"
                id="central_id"
                name="central_id"
                value={formData.central_id}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border ${
                  errors.central_id ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                placeholder="Ej: EMP-12345"
              />
              {errors.central_id && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.central_id}</p>
              )}
            </div>

            {/* Nombre Completo / FullName */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border ${
                  errors.full_name ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                placeholder="Ej: Juan Pérez García"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.full_name}</p>
              )}
            </div>

            {/* Correo Electrónico */}
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                placeholder="Ej: [email protected]"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Contraseña con Toggle de Visibilidad */}
            <div className="md:col-span-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña Temporal
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 transition-all`}
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8 sm:justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Registrar Empleado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
