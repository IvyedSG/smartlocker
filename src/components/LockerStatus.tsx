import { Check, DoorOpen, Package, AlertCircle } from 'lucide-react';
import type { LockerState } from '../types';

interface LockerStatusProps {
  status: LockerState;
  isRetrieveMode?: boolean;
}

export const LockerStatus = ({ status, isRetrieveMode = false }: LockerStatusProps) => {
  switch (status) {
    case 'available':
      return (
        <div className="bg-emerald-900/30 rounded-xl p-4 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-400">DISPONIBLE</div>
            <div className="text-emerald-300/80 text-lg">Listo para usar</div>
          </div>
        </div>
      );
    case 'open':
      return (
        <div className="bg-amber-900/30 rounded-xl p-4 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-amber-500 flex items-center justify-center">
            <DoorOpen className="w-10 h-10 text-white" strokeWidth={3} />
          </div>
          <div>
            <div className="text-3xl font-bold text-amber-400">ABIERTO</div>
            <div className="text-amber-300/80 text-lg">
              {isRetrieveMode ? 'Retiro en proceso' : 'Depósito en proceso'}
            </div>
          </div>
        </div>
      );
    case 'occupied':
      return (
        <div className="bg-blue-900/30 rounded-xl p-4 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
            <Package className="w-10 h-10 text-white" strokeWidth={3} />
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-400">OCUPADO</div>
            <div className="text-blue-300/80 text-lg">Requiere PIN para abrir</div>
          </div>
        </div>
      );
    case 'retrieved':
      return (
        <div className="bg-emerald-900/30 rounded-xl p-4 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-400">DISPONIBLE</div>
            <div className="text-emerald-300/80 text-lg">Objeto retirado</div>
          </div>
        </div>
      );
    default:
      return (
        <div className="bg-gray-900/30 rounded-xl p-4 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gray-500 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-white" strokeWidth={3} />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-400">DESCONOCIDO</div>
            <div className="text-gray-300/80 text-lg">Estado no reconocido</div>
          </div>
        </div>
      );
  }
};