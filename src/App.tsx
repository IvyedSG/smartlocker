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
        console.log("Evento opening: El locker se está abriendo", isRetrieveMode ? "en modo retiro" : "en modo depósito");
        setLockerState('open');
        
        // Si estábamos en proceso de desbloqueo, el locker ya se está abriendo físicamente
        // así que terminamos la animación de carga
        if (isUnlocking) {
          setIsUnlocking(false);
        }
        
        if (isRetrieveMode) {
          // Cuando abrimos para retiro, siempre hay un objeto presente
          setObjectDetected(true);
        }
        break;
        
      case 'store_timer':
        // Contador mientras el locker está abierto
        console.log(`Evento store_timer: contador = ${event.value}, contexto = "${event.context}"`);
        setCountdown(event.value);
        setEventContext(event.context || '');
        break;
        
      case 'object_detected':
        // Objeto detectado en el locker (sensor de distancia)
        console.log("Evento object_detected: Se detectó un objeto en el locker");
        setObjectDetected(true);
        break;
        
      case 'object_present':
        // Objeto detectado con valor de distancia
        console.log(`Evento object_present: Objeto presente a ${event.value}cm`);
        setObjectDetected(true);
        break;
        
      case 'object_still_present':
        // El objeto sigue en el locker
        console.log("Evento object_still_present: El objeto sigue en el locker");
        setObjectDetected(true);
        break;
        
      case 'object_absent':
        // No hay objeto en el locker (relevante en modo retrieve)
        console.log("Evento object_absent: No hay objeto en el locker");
        setObjectDetected(false);
        break;
        
      case 'closing_in':
        // Aviso de que se va a cerrar pronto
        console.log(`Evento closing_in: El locker se cerrará pronto (${event.value}s), contexto = "${event.context}"`);
        setEventContext(event.context || 'cerrando locker');
        break;
        
      case 'closing_timer':
        // Cuenta regresiva final antes del cierre
        console.log(`Evento closing_timer: Conteo para cierre = ${event.value}s`);
        setCountdown(event.value);
        setEventContext('cerrando locker');
        break;
        
      case 'closed':
        // El locker físicamente se ha cerrado
        console.log("===== EVENTO CLOSED RECIBIDO =====");
        console.log("Tipo de cierre:", event.tipo || "no especificado");
        console.log("Estado isRetrieveMode:", isRetrieveMode);
        console.log("Estado actual del locker:", lockerState);
        
        // Verificar el tipo de cierre enviado por el backend
        const closeType = event.tipo || "";
        
        // Asegurarse de que la animación de desbloqueo se detiene
        if (isUnlocking) {
          setIsUnlocking(false);
        }
        
        // MEJORA CRUCIAL: Usar el tipo de cierre del backend como fuente de verdad
        if (closeType === "unlock" || isRetrieveMode) {
          // Si el cierre fue por desbloqueo (retiro) o estamos en modo retiro
          console.log("MODO RETIRO (tipo='unlock') -> CAMBIANDO A PANTALLA DE AGRADECIMIENTO");
          
          // Detener cualquier timer previo para evitar interferencias
          if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
          
          // Cambiar explícitamente a 'retrieved' (pantalla de agradecimiento)
          setLockerState('retrieved');
          console.log("ESTADO CAMBIADO A: retrieved");
          
          // Programar el reinicio después de 5 segundos
          const resetTimer = setTimeout(() => {
            console.log("TEMPORIZADOR EJECUTADO: Reiniciando aplicación tras retiro exitoso");
            resetApp();
          }, 5000);
          
          // Guardamos la referencia al timer para limpiarlo si es necesario
          timerRef.current = resetTimer;
        } else {
          // Si el cierre fue por uso (depósito, tipo='use') o no se especifica tipo
          console.log("MODO DEPÓSITO (tipo='use') -> CAMBIANDO A ESTADO OCUPADO");
          setLockerState('occupied');
        }
        
        // Limpiar información contextual en ambos casos
        setEventContext('');
        setObjectDetected(false);
        break;
        
      case 'object_retrieved':
        // El objeto ha sido retirado exitosamente (confirmación específica)
        console.log("Evento object_retrieved: El objeto ha sido retirado correctamente");
        
        // Marcar que no hay objeto en el locker
        setObjectDetected(false);
        
        // Este evento solo confirma que se retiró el objeto,
        // pero NO cambia el estado del locker - esperamos el evento 'closed'
        console.log("Objeto retirado detectado. Esperando evento 'closed' para cambiar estado");
        break;
    }
  };
  
  // Inicializar conexión WebSocket una sola vez
  useEffect(() => {
    const handleConnectionOpened = () => {
      setWsConnected(true);
    };
    
    // Verificar si ya tenemos una conexión activa antes de intentar conectar
    if (!wsConnected) {
      console.log("Iniciando conexión WebSocket...");
      websocketService.connect();
      websocketService.addEventListener(handleWebSocketEvent);
      websocketService.onConnectionOpen(handleConnectionOpened);
    }
    
    // Función de limpieza solo cuando el componente se desmonta completamente
    return () => {
      console.log("Limpiando recursos de WebSocket...");
      websocketService.removeEventListener(handleWebSocketEvent);
      websocketService.removeConnectionOpenHandler(handleConnectionOpened);
      
      // Limpia cualquier timer pendiente
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      // Solo desconectar si la app se está desmontando completamente
      if (document.visibilityState === 'hidden') {
        websocketService.disconnect();
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
    
    try {
      // Call API to unlock the locker
      const response = await unlockLocker(pin);
      console.log('Respuesta del API de desbloqueo:', response);
      
      // Marcar el modo de retiro para que los componentes muestren la interfaz adecuada
      setIsRetrieveMode(true);
      
      // Si no hay WebSocket conectado, implementamos una solución alternativa
      if (!wsConnected) {
        console.log("WebSocket no conectado, simulando flujo de retiro...");
        // Forzar el estado open para simular la apertura del locker
        setLockerState('open');
        // Comenzar con objeto presente en el locker
        setObjectDetected(true);
        
        // Simular temporizador
        let count = 10;
        setCountdown(count);
        setEventContext('esperando retiro del objeto');
        
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
            
            // Simular cierre del locker
            setLockerState('retrieved');
            setTimeout(() => {
              resetApp();
            }, 3000);
          }
        }, 1000);
      }
      // Si hay WebSocket, los eventos de WebSocket se encargarán de actualizar el estado
    } catch (error) {
      if (error instanceof Error) {
        setPinError(error.message);
      } else {
        setPinError('Error de validación del PIN');
      }
      console.error('Error al desbloquear el locker:', error);
      // En caso de error, no vamos a modo retiro
      setIsRetrieveMode(false);
      setIsUnlocking(false); // Importante para detener la animación de carga
    } finally {
      // SOLO en caso de error cambiamos isUnlocking a false
      // Si fue exitoso, esperamos al evento "opening" para cambiar isUnlocking a false
    }
  };
   
  // (handleRetrievalFlow eliminado porque no se usa)

  // Agregar un useEffect para manejar automáticamente el flujo de retiro
  useEffect(() => {
    // Esta función se ejecutará cada vez que cambie lockerState o isRetrieveMode
    if (isRetrieveMode) {
      console.log(`Modo retiro activo, estado actual: ${lockerState}`);
      
      if (lockerState === 'open') {
        console.log("En modo retiro, esperando a que el usuario retire su objeto");
      } else if (lockerState === 'retrieved') {
        console.log("Objeto retirado exitosamente, mostrando pantalla de agradecimiento");
        // Asegurarse de que la animación de desbloqueo se detiene si sigue activa
        if (isUnlocking) {
          setIsUnlocking(false);
        }
      }
    }
  }, [lockerState, isRetrieveMode, isUnlocking]);
  
  // Efecto más robusto para monitorear cambios de estado en modo retiro
  useEffect(() => {
    if (isRetrieveMode) {
      console.log(`ESTADO: Modo retiro activo, estado del locker: ${lockerState}`);
      
      if (lockerState === 'open') {
        console.log("En modo retiro, esperando a que el usuario retire su objeto");
      } else if (lockerState === 'retrieved') {
        console.log("Objeto retirado exitosamente, mostrando pantalla de agradecimiento");
        
        // Si llegamos aquí y no hay timer programado, lo programamos
        if (timerRef.current === null) {
          console.log("CREANDO TIMER DE REINICIO DESDE EFFECT (backup)");
          const resetTimer = setTimeout(() => {
            console.log("TEMPORIZADOR DE BACKUP EJECUTADO: Reiniciando aplicación tras retiro exitoso");
            resetApp();
          }, 5000);
          timerRef.current = resetTimer;
        }
      }
    }
  }, [lockerState, isRetrieveMode]);
  
  // Función para reiniciar completamente la aplicación
  const resetApp = () => {
    console.log("Iniciando proceso de reseteo de la aplicación...");
    
    // Primero limpiar cualquier timer pendiente
    if (timerRef.current !== null) {
      console.log("Limpiando timers pendientes");
      clearInterval(timerRef.current);
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // IMPORTANTE: Hacerlo de forma síncrona para garantizar que se ejecuta
    console.log("Reiniciando estados de la aplicación de forma síncrona");
    
    // Desactivamos el modo de retiro primero para evitar problemas de estado
    setIsRetrieveMode(false);
    setIsUnlocking(false);
    setObjectDetected(false);
    setEventContext('');
    setCountdown(10);
    setPinError('');
    setApiError(null);
    setPin('');
    setEmail('');
    
    // Finalmente, cambiamos el estado del locker al disponible
    setLockerState('available');
    
    console.log("Aplicación reiniciada completamente");
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
            isRetrieveMode={isRetrieveMode} // Pasamos el modo actual
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
          <StatusPanel status={lockerState} isRetrieveMode={isRetrieveMode} />
          
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

