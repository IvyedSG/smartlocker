import { useState, useEffect, useRef } from 'react';
import { useFullscreen } from './hooks/useFullscreen';
import { validateEmail, generatePin } from './utils/validation';
import { FullscreenButton } from './components/FullscreenButton';
import { StatusPanel } from './components/StatusPanel';
import { AvailableState } from './components/states/AvailableState';
import { OpenState } from './components/states/OpenState';
import { OccupiedState } from './components/states/OccupiedState';
import { RetrievedState } from './components/states/RetrievedState';
import type { LockerState } from './types';

function App() {
  // State variables
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [lockerState, setLockerState] = useState<LockerState>('available');
  const [countdown, setCountdown] = useState(10);
  const countdownRef = useRef<number | null>(null);
  const [generatedPin, setGeneratedPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  
  // Use the fullscreen hook
  const { isFullscreen, requestFullscreen } = useFullscreen();
  
  // Handle using the locker
  const handleUseLocker = () => {
    if (!email) {
      alert('Por favor ingrese su correo electrónico');
      return;
    }
    
    if (!validateEmail(email)) {
      alert('Por favor ingrese un correo electrónico válido');
      return;
    }
    
    // Generate PIN for later verification
    const newPin = generatePin();
    setGeneratedPin(newPin);
    console.log('PIN generado:', newPin); // In a real app, this would be sent via email
    
    // Change state to open
    setLockerState('open');
    // Reset countdown to 10 seconds
    setCountdown(10);
    
    // Start countdown timer
    if (countdownRef.current !== null) {
      clearInterval(countdownRef.current);
    }
    
    // Use window.setInterval for browser compatibility
    countdownRef.current = window.setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // When countdown reaches 0, change to occupied state
          setLockerState('occupied');
          if (countdownRef.current !== null) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Handle PIN submission
  const handlePinSubmit = () => {
    if (!pin) {
      setPinError('Por favor ingrese el PIN');
      return;
    }
    
    if (pin === generatedPin) {
      // PIN is correct, open the locker
      setPinError('');
      setLockerState('retrieved');
      
      // Simulate locker closing after retrieval
      setTimeout(() => {
        setLockerState('available');
        setPin('');
        setEmail('');
      }, 3000);
    } else {
      setPinError('PIN incorrecto, por favor intente de nuevo');
    }
  };
  
  // Handle component cleanup
  useEffect(() => {
    // Add a class to the body for styling
    document.body.classList.add('kiosk-display');
    
    // Clean up on unmount
    return () => {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen();
      }
      document.body.classList.remove('kiosk-display');
      
      // Clear any active timers
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
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
          />
        );
        
      case 'open':
        return (
          <OpenState 
            email={email} 
            countdown={countdown} 
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
          />
        );
        
      case 'retrieved':
        return <RetrievedState />;
      
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
          {/* Left Panel - Locker Information (ahora más ancho) */}
          <StatusPanel status={lockerState} />
          
          {/* Right Panel - Interactive Area */}
          <div className="w-3/5 bg-white p-10 flex flex-col justify-center items-center">
            {renderLockerState()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;