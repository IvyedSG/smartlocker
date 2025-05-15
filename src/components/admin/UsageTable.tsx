import { useState } from 'react';
import { Check, Clock, AlertTriangle, Calendar, ChevronRight } from 'lucide-react';
import type { LockerUsageRecord } from '../../types';
import { LockerDetailModal } from './LockerDetailModal';

interface UsageTableProps {
  records: LockerUsageRecord[];
}

export const UsageTable = ({ records }: UsageTableProps) => {
  // Estado para el modal de detalles
  const [selectedLocker, setSelectedLocker] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Ordenar registros por ID de locker
  const sortedRecords = [...records].sort((a, b) => {
    // Extraer números del ID y comparar
    const numA = parseInt(a.lockerId.replace(/\D/g, ''));
    const numB = parseInt(b.lockerId.replace(/\D/g, ''));
    return numA - numB;
  });
  
  // Función para abrir el modal de detalles
  const openLockerDetails = (lockerId: string) => {
    setSelectedLocker(lockerId);
    setIsModalOpen(true);
  };
  
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
  
  // Función para formatear duración
  const formatDuration = (minutes: number | null): string => {
    if (minutes === null) return 'N/A';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} minutos`;
    } else if (hours === 1) {
      return `1 hora ${mins > 0 ? `${mins} min` : ''}`;
    } else {
      return `${hours} horas ${mins > 0 ? `${mins} min` : ''}`;
    }
  };
  
  // Filtrar registros para el locker seleccionado
  const getLockerHistory = (lockerId: string) => {
    return records.filter(record => record.lockerId === lockerId)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  };
  
  return (
    <>
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-x-auto">
        {sortedRecords.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 flex items-center justify-center rounded-full mb-4">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No hay registros disponibles</h3>
            <p className="mt-1 text-gray-500">
              No se encontraron registros que coincidan con los criterios de búsqueda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Locker ID
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario Actual
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Inicio
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Fin
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duración
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alertas
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{record.lockerId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-[200px] truncate">{record.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{formatDate(record.startTime)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.endTime ? (
                        <div className="text-sm text-gray-600">{formatDate(record.endTime)}</div>
                      ) : (
                        <span className="text-sm text-gray-400">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.status === 'active' ? (
                        <div className="flex items-center text-blue-600">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>En curso</span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">{formatDuration(record.duration)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.alerts.length > 0 ? (
                        <div className="flex items-center text-amber-600">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          <span>{record.alerts.length}</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-green-600">
                          <Check className="w-4 h-4 mr-1" />
                          <span>Ninguna</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button 
                        onClick={() => openLockerDetails(record.lockerId)}
                        className="text-blue-600 hover:text-blue-900 flex items-center justify-end w-full"
                      >
                        <span>Historial</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Modal de detalles del locker */}
      {isModalOpen && selectedLocker && (
        <LockerDetailModal
          lockerId={selectedLocker}
          records={getLockerHistory(selectedLocker)}
          onClose={() => setIsModalOpen(false)}
          formatDate={formatDate}
          formatDuration={formatDuration}
        />
      )}
    </>
  );
};