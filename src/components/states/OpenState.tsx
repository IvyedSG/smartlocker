import { Mail, DoorOpen, Timer, AlertCircle, Check } from 'lucide-react';

interface OpenStateProps {
  email: string;
  countdown: number;
  objectDetected: boolean;
  context: string;
}

export const OpenState = ({ email, countdown, objectDetected, context }: OpenStateProps) => {
  const isClosing = context.includes('cerr');

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-blue-50 border-l-8 border-blue-500 p-6 rounded-lg mb-10">
        <div className="flex items-start gap-4">
          <Mail className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold text-blue-800 mb-2">PIN Enviado</h3>
            <p className="text-blue-700 text-lg">
              Se ha enviado un PIN de 6 dígitos a su correo electrónico: <strong>{email}</strong>. 
              Por favor, guarde este PIN para poder recuperar sus pertenencias.
            </p>
          </div>
        </div>
      </div>
      
      <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">Locker Abierto</h2>
      
      <div 
        className={`${
          isClosing 
            ? 'bg-amber-50 border-amber-200'
            : objectDetected 
              ? 'bg-green-50 border-green-200' 
              : 'bg-amber-50 border-amber-200'
        } border-8 rounded-xl p-10 mb-10 text-center`}
      >
        <div className="flex justify-center mb-8">
          {objectDetected ? (
            <Check className="w-32 h-32 text-green-500" />
          ) : (
            <DoorOpen className="w-32 h-32 text-amber-500" />
          )}
        </div>
        
        <h3 className={`text-3xl font-bold mb-6 ${
          objectDetected ? 'text-green-800' : 'text-amber-800'
        }`}>
          {objectDetected 
            ? 'Objeto detectado' 
            : 'Esperando que coloque su objeto...'}
        </h3>
        
        <div className={`flex items-center justify-center gap-4 text-2xl ${
          isClosing ? 'text-red-600 animate-pulse' : (objectDetected ? 'text-green-700' : 'text-amber-700')
        }`}>
          <Timer className="w-8 h-8" />
          <span>
            {isClosing 
              ? `Cerrando automáticamente en ${countdown}s`
              : objectDetected 
                ? `Detectando movimiento... ${countdown}s` 
                : `Cerrando automáticamente en ${countdown}s`}
          </span>
        </div>
      </div>
      
      <div className="bg-gray-50 border-l-8 border-gray-400 p-6 rounded-lg">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-gray-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Importante</h3>
            <p className="text-gray-700 text-lg">
              Una vez cerrado el locker, podrá recuperar su objeto utilizando el PIN enviado a su correo.
              El tiempo máximo de almacenamiento es de 48 horas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};