import { useState, useEffect, useRef } from 'react';
import { useFullscreen } from './hooks/useFullscreen';
import { validateEmail } from './utils/validation';
import { FullscreenButton } from './components/FullscreenButton';
import { StatusPanel } from './components/StatusPanel';
import { AvailableState } from './components/states/AvailableState';
import { OpenState } from './components/states/OpenState';
import { OccupiedState } from './components/states/OccupiedState';
import { RetrievedState } from './components/states/RetrievedState';
import { useLocker, unlockLocker } from './services/apiService';
import { websocketService } from './services/websocketService';
import type { LockerEvent } from './services/websocketService';
import type { LockerState } from './types';

function App() {
  // State variables
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [lockerState, setLockerState] = useState<LockerState>('available');
  const [countdown, setCountdown] = useState(10);
  const [pinError, setPinError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [eventContext, setEventContext] = useState<string>('');
  // Estado para rastrear la disponibilidad de WebSocket
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  // Nueva variable para la detección de objetos
  const [objectDetected, setObjectDetected] = useState<boolean>(false);
  // Modo actual (store o retrieve)
  const [isRetrieveMode, setIsRetrieveMode] = useState<boolean>(false);
  
  // Timer references para limpieza
  const timerRef = useRef<number | null>(null);
  
  // Use the fullscreen hook
  const { isFullscreen, requestFullscreen } = useFullscreen();

  // WebSocket event handler
  const handleWebSocketEvent = (event: LockerEvent) => {
    console.log('WebSocket event received:', event);
    
    // Si recibimos eventos, significa que estamos conectados
    if (!wsConnected) {
      setWsConnected(true);
    }
    
    switch (event.event) {
      case 'opening':
        // El locker físicamente ha comenzado a abrirse
        if (isRetrieveMode) {
          setLockerState('retrieved'); // Comienza a mostrar la interfaz de retirado
        } else {
          setLockerState('open'); // Comienza a mostrar la interfaz de depósito
        }
        break;
        
      case 'store_timer':
        // Contador que se reinicia mientras hay detección de movimiento
        setCountdown(event.value);
        setEventContext(event.context || '');
        break;
        
      case 'object_detected':
      case 'object_present':
        // Objeto detectado en el locker (sensor de distancia)
        setObjectDetected(true);
        // Resetear cualquier UI relacionada con espera
        break;
        
      case 'object_absent':
        // No hay objeto en el locker (relevante en modo retrieve)
        setObjectDetected(false);
        break;
        
      case 'object_still_present':
        // El objeto aún no ha sido retirado (modo retrieve)
        setObjectDetected(true);
        break;
        
      case 'closing_in':
        // Aviso de que se va a cerrar pronto
        setEventContext(event.context || 'cerrando locker');
        break;
        
      case 'closing_timer':
        // Cuenta regresiva final antes del cierre
        setCountdown(event.value);
        setEventContext(event.context || 'cerrando locker');
        break;
        
      case 'closed':
        // El locker físicamente se ha cerrado
        if (isRetrieveMode) {
          // Si estábamos en modo retiro, ahora está disponible
          // El backend ya maneja el cambio de estado en BD
          setLockerState('available');
          setIsRetrieveMode(false);
        } else {
          // Si estábamos en modo depósito, ahora está ocupado
          setLockerState('occupied');
        }
        // Limpiar información contextual
        setEventContext('');
        setObjectDetected(false);
        break;
        
      case 'object_retrieved':
        // El servidor confirma que el objeto ha sido retirado
        // Este evento es más para logs, la UI ya está en estado 'retrieved'
        // y la transición a 'available' ocurrirá con 'closed'
        break;
    }
  };
  
  // Inicializar conexión WebSocket
  useEffect(() => {
    const handleConnectionOpened = () => {
      setWsConnected(true);
    };
    
    websocketService.connect();
    websocketService.addEventListener(handleWebSocketEvent);
    websocketService.onConnectionOpen(handleConnectionOpened);
    
    return () => {
      websocketService.removeEventListener(handleWebSocketEvent);
      websocketService.removeConnectionOpenHandler(handleConnectionOpened);
      websocketService.disconnect();
      
      // Limpiar cualquier timer pendiente
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  // Manejar uso del locker (depósito)
  const handleUseLocker = async () => {
    setApiError(null);
    
    if (!email) {
      alert('Por favor ingrese su correo electrónico');
      return;
    }
    
    if (!validateEmail(email)) {
      alert('Por favor ingrese un correo electrónico válido');
      return;
    }
    
    setIsLoading(true);
    setIsRetrieveMode(false); // Asegurarnos de que estamos en modo depósito
    
    try {
      const response = await useLocker(email);
      console.log('Respuesta del API:', response);
      
      // Si WebSocket no está conectado, implementar una cuenta regresiva manual
      if (!wsConnected) {
        setLockerState('open');
        let count = 10;
        setCountdown(count);
        
        // UsarRef para el timer para limpieza adecuada
        if (timerRef.current !== null) {
          clearInterval(timerRef.current);
        }
        
        timerRef.current = window.setInterval(() => {
          count--;
          setCountdown(count);
          
          if (count <= 0) {
            if (timerRef.current !== null) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            setLockerState('occupied');
          }
        }, 1000);
      }
      // En caso contrario, WebSocket manejará los estados
      // La transición a 'open' ocurrirá en el handler de eventos
      
    } catch (error) {
      if (error instanceof Error) {
        setApiError(error.message);
      } else {
        setApiError('Ha ocurrido un error desconocido');
      }
      console.error('Error al usar el locker:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Manejar envío de PIN (retiro)
  const handlePinSubmit = async () => {
    // Reset previous errors
    setPinError('');
    
    if (!pin) {
      setPinError('Por favor ingrese el PIN');
      return;
    }
    
    if (pin.length !== 6) {
      setPinError('El PIN debe tener 6 dígitos');
      return;
    }
    
    setIsUnlocking(true);
    setIsRetrieveMode(true); // Establecer que estamos en modo retiro
    
    try {
      // Call API to unlock the locker
      const response = await unlockLocker(pin);
      console.log('Respuesta del API de desbloqueo:', response);
      
      // Si no hay WebSocket, manejar la transición manualmente
      if (!wsConnected) {
        setLockerState('retrieved');
        // Después de un tiempo, volver a disponible
        setTimeout(() => setLockerState('available'), 5000);
      }
      // En caso contrario, WebSocket manejará las transiciones
      // La transición a 'retrieved' ocurrirá con el evento 'opening'
      
    } catch (error) {
      if (error instanceof Error) {
        setPinError(error.message);
      } else {
        setPinError('Error de validación del PIN');
      }
      console.error('Error al desbloquear el locker:', error);
      // Reset del modo retiro en caso de error
      setIsRetrieveMode(false);
    } finally {
      setIsUnlocking(false);
    }
  };
  
  // Handle component cleanup
  useEffect(() => {
    // Remove admin-page class if coming from that page
    document.body.classList.remove('admin-page');
    // Add a class to the body for styling
    document.body.classList.add('kiosk-display');
    
    // Clean up on unmount
    return () => {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen();
      }
      document.body.classList.remove('kiosk-display');
    };
  }, []);

  // Render the right panel based on the locker state
  const renderLockerState = () => {
    switch (lockerState) {
      case 'available':
        return (
          <AvailableState 
            email={email} 
            setEmail={setEmail} 
            handleUseLocker={handleUseLocker}
            isLoading={isLoading}
            apiError={apiError}
          />
        );
        
      case 'open':
        return (
          <OpenState 
            email={email}
            countdown={countdown} 
            objectDetected={objectDetected}
            context={eventContext}
          />
        );
      
      case 'occupied':
        return (
          <OccupiedState 
            pin={pin} 
            setPin={setPin} 
            email={email} 
            pinError={pinError} 
            handlePinSubmit={handlePinSubmit}
            isLoading={isUnlocking}
          />
        );
        
      case 'retrieved':
        return (
          <RetrievedState 
            countdown={countdown}
            closing={eventContext.includes('cerr')}
          />
        );
      
      default:
        return (
          <div className="w-full text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Estado no implementado aún</h2>
            <p className="text-xl text-gray-600">Este estado se implementará en la siguiente fase.</p>
          </div>
        );
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-800 to-gray-950 flex items-center justify-center overflow-hidden p-4">
      {/* Fullscreen button - only shown when not in fullscreen mode */}
      {!isFullscreen && <FullscreenButton onClick={requestFullscreen} />}
      
      {/* Kiosk Display Container */}
      <div className="w-full h-full max-h-[900px] max-w-7xl flex items-center justify-center p-0 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-2xl overflow-hidden border-8 border-slate-700 flex flex-row">
          {/* Left Panel - Locker Information */}
          <StatusPanel status={lockerState} />
          
          {/* Right Panel - Interactive Area */}
          <div className="w-3/5 bg-white p-10 flex flex-col justify-center items-center">
            {renderLockerState()}
          </div>
        </div>
      </div>
      
      {/* Context message - Optional, for debugging */}
      {eventContext && (
        <div className="fixed bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
          {eventContext}
        </div>
      )}
    </div>
  );
}

export default App;

