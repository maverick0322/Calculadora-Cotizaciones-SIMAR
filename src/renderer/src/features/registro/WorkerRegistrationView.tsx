import { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, Lock, RefreshCw, UserPlus, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { WorkerData, WorkerSummary } from '../../../../shared/types/Worker';

interface WorkerRegistrationProps {
  onBack: () => void;
}

interface WorkerFormState {
  rfc: string;
  firstName: string;
  lastName: string;
  maternalLastName: string;
  employeeId: string;
  employeeKey: string;
  initials: string;
  address: string;
  email: string;
  password: string;
}

const INITIAL_FORM_STATE: WorkerFormState = {
  rfc: '',
  firstName: '',
  lastName: '',
  maternalLastName: '',
  employeeId: '',
  employeeKey: '',
  initials: '',
  address: '',
  email: '',
  password: ''
};

const MIN_PASSWORD_LENGTH = 6;
const RFC_PATTERN = /^[A-Z&Ñ]{3,4}\d{6}[A-Z\d]{3}$/i;

const buildSuggestedInitials = (formData: WorkerFormState): string => {
  const words = [formData.firstName, formData.lastName, formData.maternalLastName].filter(Boolean);
  return words.map((word) => word.trim()[0]).join('').toUpperCase();
};

const buildSuggestedEmployeeKey = (formData: WorkerFormState): string => {
  const initials = buildSuggestedInitials(formData);
  return initials ? `EMP-${initials}` : '';
};

export default function WorkerRegistrationView({ onBack }: WorkerRegistrationProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [workers, setWorkers] = useState<WorkerSummary[]>([]);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(false);
  const [formData, setFormData] = useState<WorkerFormState>(INITIAL_FORM_STATE);
  const [isSuperKeyModalOpen, setIsSuperKeyModalOpen] = useState(false);
  const [superUserKey, setSuperUserKey] = useState('');
  const [superUserKeyError, setSuperUserKeyError] = useState('');

  const suggestedInitials = useMemo(() => buildSuggestedInitials(formData), [
    formData.firstName,
    formData.lastName,
    formData.maternalLastName
  ]);

  const fetchWorkers = async () => {
    setIsLoadingWorkers(true);
    try {
      const response = await window.api.listWorkers();
      if (response.success && response.data) {
        setWorkers(response.data);
        return;
      }

      toast.error(response.error || 'No se pudo cargar el listado de empleados');
    } catch {
      toast.error('Error de comunicación al cargar empleados');
    } finally {
      setIsLoadingWorkers(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((current) => {
      const next = { ...current, [name]: value };
      if (['firstName', 'lastName', 'maternalLastName'].includes(name)) {
        next.initials = current.initials || buildSuggestedInitials(next);
        next.employeeKey = current.employeeKey || buildSuggestedEmployeeKey(next);
      }

      return next;
    });

    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: '' }));
    }
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!RFC_PATTERN.test(formData.rfc.trim())) nextErrors.rfc = 'Ingresa un RFC válido';
    if (!formData.firstName.trim()) nextErrors.firstName = 'El nombre es requerido';
    if (!formData.lastName.trim()) nextErrors.lastName = 'El apellido paterno es requerido';
    if (!formData.employeeId.trim()) nextErrors.employeeId = 'El ID del empleado es requerido';
    if (!formData.employeeKey.trim()) nextErrors.employeeKey = 'La clave del empleado es requerida';
    if (!formData.initials.trim()) nextErrors.initials = 'Las iniciales son requeridas';
    if (!formData.email.trim()) nextErrors.email = 'El correo es requerido';
    if (formData.password.length < MIN_PASSWORD_LENGTH) nextErrors.password = 'La contraseña debe tener al menos 6 caracteres';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
    setSuperUserKey('');
    setSuperUserKeyError('');
    setIsSuperKeyModalOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    setSuperUserKey('');
    setSuperUserKeyError('');
    setIsSuperKeyModalOpen(true);
  };

  const handleConfirmRegistration = async () => {
    if (!superUserKey.trim()) {
      setSuperUserKeyError('La clave de superusuario es requerida');
      return;
    }

    const toastId = toast.loading('Registrando empleado...');
    const payload: WorkerData = {
      rfc: formData.rfc.trim().toUpperCase(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      maternalLastName: formData.maternalLastName.trim(),
      employeeId: formData.employeeId.trim(),
      employeeKey: formData.employeeKey.trim().toUpperCase(),
      initials: formData.initials.trim().toUpperCase(),
      address: formData.address.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      superUserKey,
      role: 'sales',
      isActive: true
    };

    try {
      const response = await window.api.registerWorker(payload);
      if (response.success) {
        toast.success('Empleado registrado exitosamente', { id: toastId });
        resetForm();
        fetchWorkers();
        return;
      }

      toast.error(response.error || 'Error al registrar empleado', { id: toastId });
    } catch {
      toast.error('Error de comunicación al registrar empleado', { id: toastId });
    }
  };

  const inputClass = (field: keyof WorkerFormState) =>
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
      errors[field] ? 'border-red-300' : 'border-gray-300'
    }`;

  const renderError = (field: keyof WorkerFormState) =>
    errors[field] ? <p className="mt-1 text-sm text-red-600 font-medium">{errors[field]}</p> : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
            Empleados <Users className="w-6 h-6 text-blue-600" />
          </h1>
          <p className="text-sm text-gray-500">Administra usuarios locales del sistema de cotizaciones.</p>
        </div>
        <button
          type="button"
          onClick={fetchWorkers}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingWorkers ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">Usuarios registrados</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Clave</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Empleado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Iniciales</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Rol</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {workers.map((worker) => (
                  <tr key={worker.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{worker.employeeKey || worker.employeeId}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{worker.fullName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{worker.initials || 'N/D'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{worker.role === 'admin' ? 'Administrador' : 'Ventas'}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                        {worker.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
                {workers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                      {isLoadingWorkers ? 'Cargando empleados...' : 'No hay empleados registrados.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <UserPlus className="w-5 h-5 text-gray-700" />
              <h2 className="text-base font-semibold text-gray-900">Registrar empleado</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
            <div>
              <label htmlFor="rfc" className="block text-sm font-medium text-gray-700 mb-1">RFC</label>
              <input id="rfc" name="rfc" value={formData.rfc} onChange={handleInputChange} className={inputClass('rfc')} />
              {renderError('rfc')}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} className={inputClass('firstName')} />
                {renderError('firstName')}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Apellido paterno</label>
                <input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} className={inputClass('lastName')} />
                {renderError('lastName')}
              </div>
            </div>

            <div>
              <label htmlFor="maternalLastName" className="block text-sm font-medium text-gray-700 mb-1">Apellido materno</label>
              <input id="maternalLastName" name="maternalLastName" value={formData.maternalLastName} onChange={handleInputChange} className={inputClass('maternalLastName')} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                <input id="employeeId" name="employeeId" value={formData.employeeId} onChange={handleInputChange} className={inputClass('employeeId')} />
                {renderError('employeeId')}
              </div>
              <div>
                <label htmlFor="employeeKey" className="block text-sm font-medium text-gray-700 mb-1">Clave</label>
                <input id="employeeKey" name="employeeKey" value={formData.employeeKey} onChange={handleInputChange} placeholder={buildSuggestedEmployeeKey(formData)} className={inputClass('employeeKey')} />
                {renderError('employeeKey')}
              </div>
              <div>
                <label htmlFor="initials" className="block text-sm font-medium text-gray-700 mb-1">Iniciales</label>
                <input id="initials" name="initials" value={formData.initials} onChange={handleInputChange} placeholder={suggestedInitials} className={inputClass('initials')} />
                {renderError('initials')}
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Domicilio</label>
              <textarea id="address" name="address" value={formData.address} onChange={handleInputChange} className={`${inputClass('address')} min-h-20 resize-none`} />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className={inputClass('email')} />
              {renderError('email')}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña temporal</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`${inputClass('password')} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {renderError('password')}
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 sm:justify-end">
              <button
                type="button"
                onClick={onBack}
                className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
              >
                Volver
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-sm"
              >
                Registrar
              </button>
            </div>
          </form>
        </section>
      </div>

      {isSuperKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl border border-gray-200">
            <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
              <Lock className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-semibold text-gray-900">Confirmar registro</h2>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div>
                <label htmlFor="modalSuperUserKey" className="block text-sm font-medium text-gray-700 mb-1">Clave de superusuario</label>
                <input
                  id="modalSuperUserKey"
                  type="password"
                  value={superUserKey}
                  onChange={(event) => {
                    setSuperUserKey(event.target.value);
                    if (superUserKeyError) setSuperUserKeyError('');
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    superUserKeyError ? 'border-red-300' : 'border-gray-300'
                  }`}
                  autoFocus
                />
                {superUserKeyError && <p className="mt-1 text-sm text-red-600 font-medium">{superUserKeyError}</p>}
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSuperKeyModalOpen(false);
                    setSuperUserKey('');
                    setSuperUserKeyError('');
                  }}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRegistration}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Confirmar registro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
