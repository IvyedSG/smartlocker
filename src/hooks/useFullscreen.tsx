import { useState, useEffect } from 'react';

interface FullscreenHook {
  isFullscreen: boolean;
  requestFullscreen: () => Promise<void>;
  checkFullscreen: () => void;
}

export const useFullscreen = (): FullscreenHook => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check if we're in fullscreen mode
  const checkFullscreen = () => {
    const fullscreenElement = 
      document.fullscreenElement || 
      document['webkitFullscreenElement'] || 
      document['mozFullScreenElement'] || 
      document['msFullscreenElement'];
    
    setIsFullscreen(!!fullscreenElement);
  };
  
  // Request fullscreen method
  const requestFullscreen = async () => {
    try {
      // Aseguramos que esto se llame desde un evento de usuario
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement['webkitRequestFullscreen']) {
        await document.documentElement['webkitRequestFullscreen']();
      } else if (document.documentElement['mozRequestFullScreen']) {
        await document.documentElement['mozRequestFullScreen']();
      } else if (document.documentElement['msRequestFullscreen']) {
        await document.documentElement['msRequestFullscreen']();
      }
      
      // Verificamos el estado después de solicitar pantalla completa
      setTimeout(checkFullscreen, 100);
    } catch (err) {
      console.error('Fullscreen request failed:', err);
    }
  };

  useEffect(() => {
    // Add fullscreen change listeners
    document.addEventListener('fullscreenchange', checkFullscreen);
    document.addEventListener('webkitfullscreenchange', checkFullscreen);
    document.addEventListener('mozfullscreenchange', checkFullscreen);
    document.addEventListener('MSFullscreenChange', checkFullscreen);
    
    // Check initial fullscreen status
    checkFullscreen();
    
    // Handle iOS specific fullscreen behavior
    if ('standalone' in navigator && navigator['standalone']) {
      setIsFullscreen(true);
    }
    
    // Clean up on unmount
    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreen);
      document.removeEventListener('webkitfullscreenchange', checkFullscreen);
      document.removeEventListener('mozfullscreenchange', checkFullscreen);
      document.removeEventListener('MSFullscreenChange', checkFullscreen);
    };
  }, []);

  return { isFullscreen, requestFullscreen, checkFullscreen };
};