import { Users, Clock, AlertTriangle, Shield, TrendingUp } from 'lucide-react';
import type { LockerStats } from '../../types';

interface StatsPanelProps {
  stats: LockerStats;
}

export const StatsPanel = ({ stats }: StatsPanelProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {/* Total de usos */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-500 mb-1">Total de Usos</p>
            <h3 className="text-3xl font-bold text-gray-800">{stats.totalUsage}</h3>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-4 text-sm text-green-600 flex items-center">
          <TrendingUp className="h-4 w-4 mr-1" />
          <span>+12.5% vs. mes pasado</span>
        </div>
      </div>
      
      {/* Duración promedio */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-500 mb-1">Duración Promedio</p>
            <h3 className="text-3xl font-bold text-gray-800">
              {Math.floor(stats.averageDuration / 60)}h {stats.averageDuration % 60}m
            </h3>
          </div>
          <div className="bg-purple-100 p-3 rounded-lg">
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          <span>Tiempo promedio de uso</span>
        </div>
      </div>
      
      {/* Disponibilidad */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-500 mb-1">Disponibilidad</p>
            <h3 className="text-3xl font-bold text-gray-800">{stats.availabilityRate}%</h3>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${stats.availabilityRate}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Alertas totales */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-500 mb-1">Alertas Totales</p>
            <h3 className="text-3xl font-bold text-gray-800">{stats.alertsCount}</h3>
          </div>
          <div className="bg-amber-100 p-3 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
        </div>
        <div className="mt-4 text-sm text-amber-600">
          <span>{stats.alertsCount > 0 ? `${Math.round((stats.alertsCount / stats.totalUsage) * 100)}% de los usos` : 'Sin alertas'}</span>
        </div>
      </div>
      
      {/* Intentos no autorizados */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-500 mb-1">Accesos No Autorizados</p>
            <h3 className="text-3xl font-bold text-gray-800">{stats.unauthorizedAttempts}</h3>
          </div>
          <div className="bg-red-100 p-3 rounded-lg">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
        </div>
        <div className="mt-4 text-sm text-red-600">
          <span>Requiere atención de seguridad</span>
        </div>
      </div>
    </div>
  );
};