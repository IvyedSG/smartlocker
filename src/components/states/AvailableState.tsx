import { Mail, DoorOpen, X, Clock, Info, AlertCircle, Loader } from 'lucide-react';

interface AvailableStateProps {
  email: string;
  setEmail: (email: string) => void;
  handleUseLocker: () => void;
  isLoading: boolean;
  apiError: string | null;
}

export const AvailableState = ({ 
  email, 
  setEmail, 
  handleUseLocker,
  isLoading,
  apiError
}: AvailableStateProps) => {
  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">Utilizar Locker</h2>
      
      <div className="bg-blue-50 border-l-8 border-blue-500 p-6 rounded-lg mb-8">
        <div className="flex items-start gap-4">
          <Info className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold text-blue-800 mb-2">Instrucciones de Uso</h3>
            <p className="text-blue-700 text-lg">
              Ingrese su correo electrónico para comenzar. Se le enviará un PIN de acceso a este correo para que pueda 
              recuperar sus pertenencias posteriormente.
            </p>
          </div>
        </div>
      </div>
      
      {/* Error message if API request fails */}
      {apiError && (
        <div className="bg-red-50 border-l-8 border-red-500 p-6 rounded-lg mb-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold text-red-800 mb-2">Error</h3>
              <p className="text-red-700 text-lg">{apiError}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Email Input */}
      <div className="space-y-4 mb-10">
        <label htmlFor="email" className="block text-gray-700 text-2xl font-medium flex items-center gap-3">
          <Mail className="text-gray-600 w-8 h-8" /> Ingrese su correo electrónico:
        </label>
        <div className="relative">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
            <Mail className="w-8 h-8 text-gray-400" />
          </div>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-20 pr-16 py-6 rounded-xl border-3 border-gray-300 focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50 transition-all outline-none text-gray-700 text-2xl"
            placeholder="ejemplo@correo.com"
            inputMode="email"
            disabled={isLoading}
          />
          {email && !isLoading && (
            <button 
              onClick={() => setEmail('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-8 h-8" />
            </button>
          )}
        </div>
      </div>
      
      {/* Submit Button */}
      <button 
        onClick={handleUseLocker}
        disabled={isLoading}
        className={`w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-6 px-8 rounded-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-4 shadow-lg text-2xl ${
          isLoading ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? (
          <>
            <Loader className="w-8 h-8 animate-spin" /> Procesando...
          </>
        ) : (
          <>
            <DoorOpen className="w-8 h-8" /> Usar Locker
          </>
        )}
      </button>
      
      <div className="mt-8 text-center text-gray-500 flex items-center justify-center gap-3 text-xl">
        <Clock className="w-6 h-6" /> Toque el botón para comenzar a usar el locker
      </div>
    </div>
  );
};