import { Clock, Map, Info, Shield, ChevronRight } from 'lucide-react';
import { LockerStatus } from './LockerStatus';
import type { LockerState } from '../types';

interface StatusPanelProps {
  status: LockerState;
}

export const StatusPanel = ({ status }: StatusPanelProps) => {
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
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold">Locker Smart</h1>
        </div>
        
        <div className="text-6xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
          #LC-001
          <span className="text-lg bg-emerald-600 text-white px-3 py-1 rounded-full">Premium</span>
        </div>
        
        <div className="border-t border-b border-gray-700 py-6 my-6">
          <div className="text-xl mb-2 text-gray-400">Estado Actual:</div>
          <LockerStatus status={status} />
        </div>
        
        <div className="space-y-6 mt-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Map className="w-6 h-6 text-emerald-400" />
              <h3 className="text-xl font-semibold text-gray-300">Ubicación</h3>
            </div>
            <p className="text-gray-400 text-lg">Terminal 2, Nivel 3</p>
            <p className="text-gray-400 text-lg">Junto a Información Turística</p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Info className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-semibold text-gray-300">Información</h3>
            </div>
            <div className="text-gray-400 space-y-2">
              <div className="flex items-center justify-between">
                <span>Dimensiones:</span>
                <span className="text-gray-300">40cm × 50cm × 60cm</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tiempo máximo:</span>
                <span className="text-gray-300">48 horas</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Capacidad máxima:</span>
                <span className="text-gray-300">10kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-gray-400 mt-6">
        <div className="flex items-center gap-3 mb-3">
          <Clock className="w-6 h-6 text-emerald-400" />
          <span className="text-lg">{getCurrentDateTime()}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm">© 2025 Smart Locker System</div>
          <div className="bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-2 cursor-pointer flex items-center text-sm transition-colors">
            <span>Más información</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};