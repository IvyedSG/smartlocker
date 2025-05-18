import { Check, ArrowRight, Clock } from 'lucide-react';

interface RetrievedStateProps {
  countdown?: number;
  closing?: boolean;
}

export const RetrievedState = ({ countdown = 3, closing = false }: RetrievedStateProps) => {
  return (
    <div className="w-full max-w-2xl text-center">
      <div className="flex justify-center mb-10">
        <div className="h-36 w-36 rounded-full bg-emerald-100 flex items-center justify-center">
          <Check className="w-24 h-24 text-emerald-500" strokeWidth={2} />
        </div>
      </div>
      
      <h2 className="text-4xl font-bold text-gray-800 mb-8">Objeto Retirado</h2>
      
      <div className="bg-emerald-50 border-8 border-emerald-200 rounded-xl p-10 mb-10">
        <h3 className="text-3xl font-bold text-emerald-800 mb-6">¡Gracias por usar nuestro servicio!</h3>
        <p className="text-emerald-700 text-xl">
          Su objeto ha sido retirado correctamente.
          {closing && (
            <div className="mt-4 text-red-600 animate-pulse text-2xl">
              El locker se cerrará automáticamente en {countdown} segundos
            </div>
          )}
        </p>
      </div>
      
      <div className="bg-gray-50 border-gray-200 border rounded-xl p-6 flex items-center justify-between">
        <div className="text-gray-500 text-xl flex items-center gap-2">
          <Clock className="w-6 h-6" />
          <span>Volviendo al estado inicial...</span>
        </div>
        <div className="text-gray-400 animate-pulse">
          <ArrowRight className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
};