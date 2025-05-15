import { Maximize } from 'lucide-react';

interface FullscreenButtonProps {
  onClick: () => void;
}

export const FullscreenButton = ({ onClick }: FullscreenButtonProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 py-6 px-6 flex justify-center">
      <button 
        onClick={onClick}
        className="bg-emerald-600 hover:bg-emerald-700 text-white py-5 px-8 rounded-xl flex items-center gap-3 text-2xl animate-pulse shadow-lg"
      >
        <Maximize className="w-8 h-8" /> Entrar en Modo Pantalla Completa
      </button>
    </div>
  );
};