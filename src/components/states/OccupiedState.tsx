import { Lock, Key, X, AlertCircle, Package, Mail, Loader } from 'lucide-react';

interface OccupiedStateProps {
  pin: string;
  setPin: (pin: string) => void;
  email: string;
  pinError: string;
  handlePinSubmit: () => void;
  isLoading: boolean;
}

export const OccupiedState = ({ 
  pin, 
  setPin, 
  email, 
  pinError, 
  handlePinSubmit,
  isLoading
}: OccupiedStateProps) => {
  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">Recuperar Objeto</h2>
      
      {/* Reminder about email */}
      <div className="bg-blue-50 border-l-8 border-blue-500 p-6 rounded-lg mb-10">
        <div className="flex items-start gap-4">
          <Mail className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold text-blue-800 mb-2">PIN Enviado</h3>
            <p className="text-blue-700 text-lg">
              Se envió un PIN de 6 dígitos al correo: <strong>{email}</strong>.
              Por favor, revise su bandeja de entrada para obtener el código.
            </p>
          </div>
        </div>
      </div>
      
      {/* PIN Input */}
      <div className="space-y-4 mb-10">
        <label htmlFor="pin" className="block text-gray-700 text-2xl font-medium flex items-center gap-3">
          <Lock className="text-gray-600 w-8 h-8" /> Ingrese el PIN de 6 dígitos:
        </label>
        <div className="relative">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
            <Key className="w-8 h-8 text-gray-400" />
          </div>
          <input
            type="text"
            id="pin"
            value={pin}
            onChange={(e) => {
              // Allow only numbers and limit to 6 digits
              const value = e.target.value.replace(/[^0-9]/g, '');
              if (value.length <= 6) {
                setPin(value);
              }
            }}
            className="w-full pl-20 pr-16 py-6 rounded-xl border-3 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all outline-none text-gray-700 text-4xl tracking-widest text-center font-bold"
            placeholder="000000"
            inputMode="numeric"
            maxLength={6}
            disabled={isLoading}
          />
          {pin && !isLoading && (
            <button 
              onClick={() => setPin('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-8 h-8" />
            </button>
          )}
        </div>
        
        {/* Error message */}
        {pinError && (
          <div className="text-red-500 flex items-center gap-3 mt-4 text-lg">
            <AlertCircle className="w-6 h-6" />
            <span>{pinError}</span>
          </div>
        )}
      </div>
      
      {/* Submit Button */}
      <button 
        onClick={handlePinSubmit}
        disabled={isLoading || pin.length !== 6}
        className={`w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-6 px-8 rounded-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-4 shadow-lg text-2xl
          ${(isLoading || pin.length !== 6) ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <>
            <Loader className="w-8 h-8 animate-spin" /> Desbloqueando...
          </>
        ) : (
          <>
            <Key className="w-8 h-8" /> Abrir Locker
          </>
        )}
      </button>
      
      <div className="mt-8 text-center text-gray-500 flex items-center justify-center gap-3 text-xl">
        <Package className="w-6 h-6" /> Ingrese el PIN para recuperar su objeto
      </div>
    </div>
  );
};