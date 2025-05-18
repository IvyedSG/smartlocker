import axios from 'axios';

// Obtener la URL base de la API desde las variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://0.0.0.0:8000';

// Configuración base de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interfaz para la respuesta del endpoint de uso del locker
export interface LockerResponse {
  status: string; // "disponible", "ocupado", etc.
  id: number;
  updated_at: string;
  assigned_user_id: number;
  pin?: string;
}

// Interfaz para errores de validación
export interface ValidationError {
  detail: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
}

// Función para usar el locker (usar correo electrónico)
export const useLocker = async (email: string): Promise<LockerResponse> => {
  try {    
    const response = await api.post<LockerResponse>('/use', { email });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Función para desbloquear el locker con PIN
export const unlockLocker = async (pin: string): Promise<LockerResponse> => {
  try {
    const response = await api.post<LockerResponse>('/unlock', { pin });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Función para obtener el estado actual del locker
export const getLockerStatus = async (lockerId: string = '1'): Promise<LockerResponse> => {
  try {
    const response = await api.get<LockerResponse>(`/locker/${lockerId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Función para manejar errores de API de manera consistente
const handleApiError = (error: any): never => {
  if (axios.isAxiosError(error) && error.response) {
    // Si es un error de validación (422)
    if (error.response.status === 422) {
      const validationError = error.response.data as ValidationError;
      throw new Error(`Error de validación: ${validationError.detail[0]?.msg || 'Datos inválidos'}`);
    }
    // Si es un error de autenticación (401)
    if (error.response.status === 401) {
      throw new Error('No autorizado: es necesario autenticarse');
    }
    // Si es un error de acceso prohibido (403)
    if (error.response.status === 403) {
      throw new Error('Acceso prohibido: no tiene permisos para esta acción');
    }
    // Si es un error de no encontrado (404)
    if (error.response.status === 404) {
      throw new Error('Recurso no encontrado');
    }
    // Otros errores HTTP
    throw new Error(`Error ${error.response.status}: ${error.response.statusText || 'Error en la solicitud'}`);
  }
  // Errores de red u otros
  throw new Error('Error de conexión con el servidor');
};