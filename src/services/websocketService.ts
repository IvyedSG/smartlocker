// Actualizar las definiciones de eventos para incluir todos los posibles
export type LockerEvent = 
  | { event: 'store_timer'; value: number; context: string }
  | { event: 'object_present'; value: number }
  | { event: 'object_still_present' }  // Nuevo
  | { event: 'object_absent' }         // Nuevo
  | { event: 'object_detected' }
  | { event: 'object_retrieved' }      // Nuevo
  | { event: 'distance_change'; value: number }
  | { event: 'closing_in'; value: number; context: string }
  | { event: 'closing_timer'; value: number; context: string }
  | { event: 'opening' }               // Nuevo
  | { event: 'closed' };

export type WebSocketHandler = (event: LockerEvent) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private eventHandlers: WebSocketHandler[] = [];
  private lockerId: string = '1'; // Default locker ID
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number | null = null;
  private connectionOpenHandlers: (() => void)[] = [];

  // Initialize connection
  connect(lockerId: string = '1'): void {
    this.lockerId = lockerId;
    
    // Asegúrate de que cualquier conexión existente esté completamente cerrada
    if (this.socket) {
      try {
        this.disconnect();
        // Pequeño tiempo de espera para asegurar que el socket anterior se cierre completamente
        setTimeout(() => this.initializeConnection(lockerId), 100);
        return;
      } catch (error) {
        console.error('Error al desconectar el socket existente:', error);
      }
    }
    
    this.initializeConnection(lockerId);
  }
  
  // Método auxiliar para inicializar la conexión
  private initializeConnection(lockerId: string): void {
    const wsUrl = import.meta.env.VITE_WS_URL || `ws://localhost:8000/ws/locker/${lockerId}`;
    
    try {
      console.log(`WebSocket: Creando nueva conexión a ${wsUrl}`);
      this.socket = new WebSocket(wsUrl);
      
      // Set up event listeners
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      
      console.log(`WebSocket: Attempting connection to locker ${lockerId}`);
    } catch (error) {
      console.error('WebSocket: Connection error', error);
      this.attemptReconnect();
    }
  }
  
  // Desconectar de manera más limpia
    disconnect(): void {
    if (this.socket) {
        // Primero elimina todos los listeners para evitar comportamientos inesperados
        if (this.socket.onopen) this.socket.onopen = null;
        if (this.socket.onmessage) this.socket.onmessage = null;
        if (this.socket.onerror) this.socket.onerror = null;
        if (this.socket.onclose) this.socket.onclose = null;
        
        // Luego cierra la conexión
        try {
        if (this.socket.readyState === WebSocket.OPEN || 
            this.socket.readyState === WebSocket.CONNECTING) {
            this.socket.close(1000, "Disconnected by client");
        }
        } catch (e) {
        console.error("Error al cerrar el WebSocket:", e);
        }
        
        this.socket = null;
        console.log('WebSocket: Disconnected');
    }
    
    // Limpiar timeout de reconexión si existe
    if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
    }
    }
  
  // Send a message to the server
  send(data: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.error('WebSocket: Cannot send message, connection not open');
    }
  }
  
  // Register an event handler
  addEventListener(handler: WebSocketHandler): void {
    this.eventHandlers.push(handler);
  }
  
  // Remove an event handler
  removeEventListener(handler: WebSocketHandler): void {
    this.eventHandlers = this.eventHandlers.filter(h => h !== handler);
  }
  
  // Method to register connection open handlers
  onConnectionOpen(handler: () => void): void {
    this.connectionOpenHandlers.push(handler);
  }

  // Method to remove connection open handlers
  removeConnectionOpenHandler(handler: () => void): void {
    this.connectionOpenHandlers = this.connectionOpenHandlers.filter(h => h !== handler);
  }
  
  // Handle socket open event
  private handleOpen(): void {
    console.log('WebSocket: Connection established');
    this.reconnectAttempts = 0;
    
    // Notify all connection open handlers
    this.connectionOpenHandlers.forEach(handler => handler());
  }
  
  // Handle received messages
  private handleMessage(event: MessageEvent): void {
    try {
      const data: LockerEvent = JSON.parse(event.data);
      console.log('WebSocket: Received event', data);
      
      // Notify all event handlers
      this.eventHandlers.forEach(handler => handler(data));
    } catch (error) {
      console.error('WebSocket: Error parsing message', error);
    }
  }
  
  // Handle socket close event
  private handleClose(event: CloseEvent): void {
    console.log(`WebSocket: Connection closed. Code: ${event.code}, Reason: ${event.reason}`);
    
    if (!event.wasClean) {
      this.attemptReconnect();
    }
  }
  
  // Handle socket error
  private handleError(error: Event): void {
    // Solo registrar el error una vez, no en cada intento de reconexión
    if (this.reconnectAttempts === 0) {
      console.error('WebSocket: Error inicial de conexión');
    }
    this.attemptReconnect();
  }
  
  // Attempt to reconnect
  private attemptReconnect(): void {
    // Detener el heartbeat mientras intentamos reconectar
    this.stopHeartbeat();
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 30000);
      
      console.log(`WebSocket: Intentando reconectar en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      if (this.reconnectTimeout !== null) {
        clearTimeout(this.reconnectTimeout);
      }
      
      this.reconnectTimeout = window.setTimeout(() => {
        // Asegúrate de que cualquier socket antiguo esté completamente cerrado
        if (this.socket) {
          this.disconnect();
        }
        
        // Intenta conectar de nuevo
        this.initializeConnection(this.lockerId);
      }, delay);
    } else if (this.reconnectAttempts === this.maxReconnectAttempts) {
      console.error('WebSocket: Número máximo de intentos de reconexión alcanzado');
      this.reconnectAttempts++; // Incrementar para que no vuelva a mostrar este mensaje
    }
  }
}

// Create and export singleton instance
export const websocketService = new WebSocketService();