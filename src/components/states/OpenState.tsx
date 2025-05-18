import { Mail, DoorOpen, Timer, AlertCircle, Check, ArrowDown, ArrowUp, Package } from 'lucide-react';

interface OpenStateProps {
  email: string;
  countdown: number;
  objectDetected: boolean;
  context: string;
  isRetrieveMode: boolean; // Nuevo prop para diferenciar entre depósito y retiro
}

export const OpenState = ({ 
  email, 
  countdown, 
  objectDetected, 
  context,
  isRetrieveMode
}: OpenStateProps) => {
  const isClosing = context.includes('cerr');

  return (
    <div className="w-full max-w-2xl">
      {/* Mostrar el aviso de PIN sólo en modo depósito */}
      {!isRetrieveMode && (
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
      )}
      
      {/* Título diferente según el modo */}
      <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        {isRetrieveMode 
          ? "Retire su Objeto" 
          : "Deposite su Objeto"}
      </h2>
      
      {/* Panel central - Cambia su aspecto según el modo y estado */}
      <div 
        className={`${
          isClosing 
            ? 'bg-amber-50 border-amber-200'
            : isRetrieveMode
              ? objectDetected
                ? 'bg-amber-50 border-amber-200' // Modo retiro, aún hay objeto
                : 'bg-green-50 border-green-200' // Modo retiro, objeto retirado
              : objectDetected
                ? 'bg-green-50 border-green-200' // Modo depósito, objeto detectado
                : 'bg-amber-50 border-amber-200' // Modo depósito, esperando objeto
        } border-8 rounded-xl p-10 mb-10 text-center`}
      >
        <div className="flex justify-center mb-8">
          {isRetrieveMode ? (
            objectDetected ? (
              <Package className="w-32 h-32 text-amber-500" />
            ) : (
              <Check className="w-32 h-32 text-green-500" />
            )
          ) : (
            objectDetected ? (
              <Check className="w-32 h-32 text-green-500" />
            ) : (
              <DoorOpen className="w-32 h-32 text-amber-500" />
            )
          )}
        </div>
        
        {/* Título del panel - Diferentes mensajes según el modo y estado */}
        <h3 className={`text-3xl font-bold mb-6 ${
          isRetrieveMode
            ? objectDetected 
              ? 'text-amber-800' 
              : 'text-green-800'
            : objectDetected 
              ? 'text-green-800' 
              : 'text-amber-800'
        }`}>
          {isRetrieveMode
            ? objectDetected 
              ? 'Por favor retire su objeto' 
              : 'Objeto retirado correctamente'
            : objectDetected 
              ? 'Objeto detectado correctamente' 
              : 'Esperando que deposite su objeto...'}
        </h3>
        
        {/* Instrucción visual de la acción esperada */}
        <div className="flex justify-center mb-6">
          {isRetrieveMode ? (
            objectDetected ? (
              <div className="flex flex-col items-center text-amber-700">
                <ArrowUp className="w-16 h-16 animate-bounce" />
                <p className="text-xl mt-2">Retire el objeto ahora</p>
              </div>
            ) : null
          ) : (
            !objectDetected ? (
              <div className="flex flex-col items-center text-amber-700">
                <ArrowDown className="w-16 h-16 animate-bounce" />
                <p className="text-xl mt-2">Coloque el objeto en el locker</p>
              </div>
            ) : null
          )}
        </div>
        
        {/* Contador de tiempo */}
        <div className={`flex items-center justify-center gap-4 text-2xl ${
          isClosing 
            ? 'text-red-600 animate-pulse' 
            : isRetrieveMode
              ? objectDetected 
                ? 'text-amber-700' 
                : 'text-green-700'
              : objectDetected 
                ? 'text-green-700' 
                : 'text-amber-700'
        }`}>
          <Timer className="w-8 h-8" />
          <span>
            {isClosing 
              ? `Cerrando automáticamente en ${countdown}s`
              : isRetrieveMode
                ? objectDetected 
                  ? `Tiempo para retirar el objeto: ${countdown}s` 
                  : `Cerrando automáticamente en ${countdown}s`
                : objectDetected 
                  ? `Detectando objeto... ${countdown}s` 
                  : `Cerrando automáticamente en ${countdown}s`}
          </span>
        </div>
      </div>
      
      {/* Mensaje inferior - Varía según el modo */}
      <div className="bg-gray-50 border-l-8 border-gray-400 p-6 rounded-lg">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-gray-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {isRetrieveMode ? "Importante" : "Recordatorio"}
            </h3>
            <p className="text-gray-700 text-lg">
              {isRetrieveMode
                ? "El locker se cerrará automáticamente al detectar que el objeto ha sido retirado o cuando termine el contador."
                : "Una vez cerrado el locker, podrá recuperar su objeto utilizando el PIN enviado a su correo. El tiempo máximo de almacenamiento es de 48 horas."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};