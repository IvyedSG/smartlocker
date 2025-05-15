import type { LockerUsageRecord, LockerAlert, LockerStats } from '../types';
import { generateRandomDate, generateRandomId, generateRandomEmail } from '../utils/generators';

// Función para generar datos simulados de historial de uso
export const getLockerUsageHistory = (): LockerUsageRecord[] => {
  const records: LockerUsageRecord[] = [];
  
  // Generar 50 registros de ejemplo
  for (let i = 0; i < 50; i++) {
    const startTime = generateRandomDate(new Date('2025-01-01'), new Date());
    let endTime: Date | null = null;
    let duration: number | null = null;
    let status: 'completed' | 'active' | 'abandoned' = 'active';
    
    // 80% de registros completados, 15% activos, 5% abandonados
    const statusRandom = Math.random();
    if (statusRandom < 0.8) {
      status = 'completed';
      endTime = new Date(startTime.getTime() + Math.random() * 48 * 60 * 60 * 1000); // máximo 48 horas
      duration = Math.round((endTime.getTime() - startTime.getTime()) / (60 * 1000)); // duración en minutos
    } else if (statusRandom < 0.95) {
      status = 'active';
    } else {
      status = 'abandoned';
      endTime = null;
      duration = null;
    }
    
    // Generar alertas aleatorias
    const alerts: LockerAlert[] = [];
    // 30% de chance de tener al menos una alerta
    if (Math.random() < 0.3) {
      const alertCount = Math.floor(Math.random() * 3) + 1; // 1-3 alertas
      for (let j = 0; j < alertCount; j++) {
        const alertTypes: Array<'unauthorized_access' | 'invalid_pin' | 'timeout' | 'weight_exceeded' | 'maintenance_needed'> = [
          'unauthorized_access', 'invalid_pin', 'timeout', 'weight_exceeded', 'maintenance_needed'
        ];
        const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        
        // Descripción para cada tipo de alerta
        let description = '';
        switch (alertType) {
          case 'unauthorized_access':
            description = 'Intento de acceso no autorizado al locker';
            break;
          case 'invalid_pin':
            description = `PIN incorrecto ingresado ${Math.floor(Math.random() * 5) + 1} veces`;
            break;
          case 'timeout':
            description = 'Tiempo máximo de uso excedido (48 horas)';
            break;
          case 'weight_exceeded':
            description = 'Peso máximo excedido (>10kg)';
            break;
          case 'maintenance_needed':
            description = 'Se requiere mantenimiento - Sensor de puerta defectuoso';
            break;
        }
        
        alerts.push({
          id: generateRandomId(),
          recordId: `record-${i}`,
          timestamp: new Date(startTime.getTime() + Math.random() * (endTime ? endTime.getTime() - startTime.getTime() : 24 * 60 * 60 * 1000)).toISOString(),
          type: alertType,
          description,
          resolved: Math.random() > 0.3 // 70% de alertas resueltas
        });
      }
    }
    
    // Crear el registro
    records.push({
      id: `record-${i}`,
      lockerId: `LC-${String(Math.floor(Math.random() * 10) + 1).padStart(3, '0')}`,
      email: generateRandomEmail(),
      startTime: startTime.toISOString(),
      endTime: endTime ? endTime.toISOString() : null,
      duration,
      status,
      alerts
    });
  }
  
  // Ordenar por fecha de inicio (más reciente primero)
  return records.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
};

// Función para obtener estadísticas generales
export const getLockerStats = (): LockerStats => {
  return {
    totalUsage: 473,
    averageDuration: 127, // 2 horas y 7 minutos en promedio
    availabilityRate: 87.4, // 87.4% disponible
    alertsCount: 98,
    unauthorizedAttempts: 23
  };
};

// Añadir esta función para obtener registros agrupados por locker
export const getRecordsByLockerId = (lockerId: string): LockerUsageRecord[] => {
  const allRecords = getLockerUsageHistory();
  return allRecords.filter(record => record.lockerId === lockerId)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
};

// Añadir función para obtener información básica de un locker específico
export const getLockerInfo = (lockerId: string) => {
  const records = getRecordsByLockerId(lockerId);
  
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
  const uniqueUsers = [...new Set(records.map(r => r.email))];
  
  return {
    id: lockerId,
    totalUses,
    completedUses,
    abandonedUses,
    activeUses,
    isCurrentlyActive: activeUses > 0,
    totalAlerts,
    avgDuration,
    uniqueUsers: uniqueUsers.length,
    latestRecord: records.length > 0 ? records[0] : null
  };
};