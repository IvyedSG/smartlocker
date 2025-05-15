export type LockerState = 'available' | 'open' | 'occupied' | 'retrieved';

export interface LockerContextType {
  email: string;
  setEmail: (email: string) => void;
  pin: string;
  setPin: (pin: string) => void;
  generatedPin: string;
  setGeneratedPin: (pin: string) => void;
  lockerState: LockerState;
  setLockerState: (state: LockerState) => void;
  countdown: number;
  setCountdown: (count: number) => void;
  pinError: string;
  setPinError: (error: string) => void;
}