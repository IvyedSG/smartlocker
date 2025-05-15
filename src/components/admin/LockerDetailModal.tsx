import { X, AlertTriangle, Clock, User, Calendar } from 'lucide-react';
import type { LockerUsageRecord } from '../../types';

interface LockerDetailModalProps {
  lockerId: string;
  records: LockerUsageRecord[];
  onClose: () => void;
  formatDate: (date: string) => string;
  formatDuration: (minutes: number | null) => string;
}

export const LockerDetailModal = ({ 
  lockerId, 
  records, 
  onClose,
  formatDate,
  formatDuration
}: LockerDetailModalProps) => {
  // Estadísticas del locker
  const totalUses = records.length;
  const completedUses = records.filter(r => r.status === 'completed').length;
  const abandonedUses = records.filter(r => r.status === 'abandoned').length;
  const activeUses = records.filter(r => r.status === 'active').length;
  
  // Total de alertas
  const totalAlerts = records.reduce((sum, record) => sum + record.alerts.length, 0);
  
  // Promedio de duración (solo para usos completados)
  const completedRecords = records.filter(r => r.status === 'completed' && r.duration !== null);
  const avgDuration = completedRecords.length > 0 
    ? completedRecords.reduce((sum, r) => sum + (r.duration || 0), 0) / completedRecords.length 
    : 0;
  
  // Usuarios únicos
  const uniqueUsers = new Set(records.map(r => r.email)).size;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold">Historial Completo del Locker {lockerId}</h3>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Estadísticas rápidas */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm">Total de Usos</p>
              <p className="text-2xl font-bold text-gray-800">{totalUses}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm">Usuarios Únicos</p>
              <p className="text-2xl font-bold text-blue-600">{uniqueUsers}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm">Duración Promedio</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.floor(avgDuration / 60)}h {Math.round(avgDuration % 60)}m
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm">Estado Actual</p>
              <p className={`text-xl font-bold ${
                activeUses > 0 
                  ? 'text-blue-600' 
                  : 'text-green-600'
              }`}>
                {activeUses > 0 ? 'Ocupado' : 'Disponible'}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm">Alertas Totales</p>
              <p className="text-2xl font-bold text-amber-600">{totalAlerts}</p>
            </div>
          </div>
        </div>
        
        {/* Contenido principal */}
        <div className="overflow-y-auto flex-grow p-6">
          <h4 className="text-lg font-medium text-gray-800 mb-4">Historial Cronológico (Más reciente primero)</h4>
          
          {records.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Calendar className="mx-auto w-12 h-12 text-gray-400 mb-2" />
              <p className="text-gray-500">No hay registros disponibles para este locker.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {records.map(record => (
                <div 
                  key={record.id} 
                  className={`border rounded-lg overflow-hidden shadow-sm ${
                    record.status === 'active' 
                      ? 'border-blue-200 bg-blue-50' 
                      : record.status === 'completed'
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="px-4 py-3 bg-white border-b flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : record.status === 'active'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status === 'completed' 
                          ? 'Completado' 
                          : record.status === 'active' 
                            ? 'Activo' 
                            : 'Abandonado'}
                      </span>
                      <span className="text-sm text-gray-500">
                        ID: {record.id}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(record.startTime)}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Usuario</p>
                          <p className="text-sm font-medium">{record.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Duración</p>
                          <p className="text-sm font-medium">
                            {record.status === 'active' 
                              ? 'En curso' 
                              : formatDuration(record.duration)
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Alertas */}
                    {record.alerts.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span>Alertas ({record.alerts.length})</span>
                        </p>
                        <div className="space-y-2">
                          {record.alerts.map(alert => (
                            <div 
                              key={alert.id} 
                              className="text-sm bg-white p-2 rounded border border-gray-200"
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium">
                                  {alert.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </span>
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                  alert.resolved 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {alert.resolved ? 'Resuelto' : 'Pendiente'}
                                </span>
                              </div>
                              <p className="text-gray-600 text-xs">{alert.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};