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

export interface LockerUsageRecord {
  id: string;
  lockerId: string;
  email: string;
  startTime: string;
  endTime: string | null;
  duration: number | null; // en minutos
  status: 'completed' | 'active' | 'abandoned';
  alerts: LockerAlert[];
}

export interface LockerAlert {
  id: string;
  recordId: string;
  timestamp: string;
  type: 'unauthorized_access' | 'invalid_pin' | 'timeout' | 'weight_exceeded' | 'maintenance_needed';
  description: string;
  resolved: boolean;
}

export interface LockerStats {
  totalUsage: number;
  averageDuration: number; // en minutos
  availabilityRate: number; // porcentaje de tiempo disponible
  alertsCount: number;
  unauthorizedAttempts: number;
}