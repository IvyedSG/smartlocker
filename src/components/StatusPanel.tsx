import { Clock, Info, Shield, Package, Scale, Sparkles } from 'lucide-react';
import { LockerStatus } from './LockerStatus';
import type { LockerState } from '../types';

interface StatusPanelProps {
  status: LockerState;
  isRetrieveMode?: boolean;
}

export const StatusPanel = ({ status, isRetrieveMode = false }: StatusPanelProps) => {
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-2/5 bg-gradient-to-br from-gray-800 to-gray-900 p-8 flex flex-col justify-between text-white">
      <div>
        {/* Header con logo y nombre */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold">Smart Locker</h1>
        </div>
        
        {/* Código del locker */}
        <div className="text-6xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
          #LC-001
          <span className="text-lg bg-emerald-600 text-white px-3 py-1 rounded-full flex items-center">
            Premium
            <Sparkles className="w-4 h-4 ml-1 text-white" />
          </span>
        </div>
        
        {/* Estado actual - Panel destacado */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-800/50 border border-gray-700/50 rounded-xl py-8 px-6 mb-10 shadow-inner overflow-hidden">
          <div className="text-xl mb-4 text-gray-300 flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-400" />
            <span>Estado Actual:</span>
          </div>
          
          {/* Ajustado para evitar que se salga del contenedor */}
          <div className="transform scale-105 origin-left">
            <LockerStatus status={status} isRetrieveMode={isRetrieveMode} />
          </div>
        </div>
        
        {/* Especificaciones - Panel mejorado y más grande */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-5">
            <Info className="w-7 h-7 text-blue-400" />
            <h3 className="text-2xl font-semibold text-gray-300">Especificaciones</h3>
          </div>
          
          {/* Grid de especificaciones */}
          <div className="grid grid-cols-2 gap-6 text-center">
            {/* Dimensiones */}
            <div className="bg-gray-700/50 p-5 rounded-lg border border-gray-600/30">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Package className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">Dimensiones</p>
              <p className="text-xl font-medium text-white">40 × 50 × 60 cm</p>
            </div>
            
            {/* Capacidad */}
            <div className="bg-gray-700/50 p-5 rounded-lg border border-gray-600/30">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <Scale className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">Capacidad</p>
              <p className="text-xl font-medium text-white">Hasta 25 kg</p>
            </div>
          </div>
          
          {/* Tiempo máximo */}
          <div className="mt-6 pt-5 border-t border-gray-700/50">
            <div className="flex items-center justify-between text-lg">
              <span className="text-gray-400">Tiempo máximo:</span>
              <span className="text-gray-300 font-medium">48 horas</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer con fecha y hora */}
      <div className="text-gray-400 mt-4">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-6 h-6 text-emerald-400" />
          <span className="text-lg">{getCurrentDateTime()}</span>
        </div>
      </div>
    </div>
  );
};