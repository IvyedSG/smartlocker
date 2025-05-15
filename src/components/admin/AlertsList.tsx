import { AlertTriangle, Info, CheckCircle, AlertCircle, Shield, Weight, Clock, Lock } from 'lucide-react';
import type { LockerAlert, LockerUsageRecord } from '../../types';

interface AlertsListProps {
  alerts: LockerAlert[];
  records: LockerUsageRecord[];
}

export const AlertsList = ({ alerts, records }: AlertsListProps) => {
  // Ordenar por fecha (más reciente primero)
  const sortedAlerts = [...alerts].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Función para formatear fecha
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Función para obtener email del usuario por recordId
  const getUserEmail = (recordId: string): string => {
    const record = records.find(r => r.id === recordId);
    return record ? record.email : 'Usuario no identificado';
  };
  
  // Función para obtener ícono según tipo de alerta
  const getAlertIcon = (type: LockerAlert['type']) => {
    switch (type) {
      case 'unauthorized_access':
        return <Shield className="h-5 w-5 text-red-500" />;
      case 'invalid_pin':
        return <Lock className="h-5 w-5 text-amber-500" />;
      case 'timeout':
        return <Clock className="h-5 w-5 text-purple-500" />;
      case 'weight_exceeded':
        return <Weight className="h-5 w-5 text-orange-500" />;
      case 'maintenance_needed':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Función para obtener color de severidad
  const getSeverityColor = (type: LockerAlert['type']) => {
    switch (type) {
      case 'unauthorized_access':
        return 'bg-red-50 border-red-200';
      case 'invalid_pin':
        return 'bg-amber-50 border-amber-200';
      case 'timeout':
        return 'bg-purple-50 border-purple-200';
      case 'weight_exceeded':
        return 'bg-orange-50 border-orange-200';
      case 'maintenance_needed':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };
  
  return (
    <div className="space-y-6">
      {sortedAlerts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <div className="mx-auto w-24 h-24 bg-green-100 flex items-center justify-center rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No hay alertas activas</h3>
          <p className="mt-1 text-gray-500">
            Todos los lockers están funcionando correctamente.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAlerts.map((alert) => {
            const lockerId = records.find(r => r.id === alert.recordId)?.lockerId || 'Unknown';
            
            return (
              <div 
                key={alert.id} 
                className={`border rounded-xl shadow-sm ${getSeverityColor(alert.type)} overflow-hidden`}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="ml-3 w-0 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            Alerta: {alert.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Locker: <span className="font-medium">{lockerId}</span> • {formatDate(alert.timestamp)}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            alert.resolved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {alert.resolved ? 'Resuelto' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-gray-600">
                        {alert.description}
                      </p>
                      <div className="mt-3 flex items-center text-sm text-gray-500">
                        <Info className="w-4 h-4 mr-1" />
                        <span>Usuario: {getUserEmail(alert.recordId)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {!alert.resolved && (
                  <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 flex justify-between">
                    <div>
                      <span className="text-xs text-gray-500">Se requiere atención del personal</span>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Marcar como resuelto
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};