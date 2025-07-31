import { io, Socket } from 'socket.io-client';

type WebSocketEvent = {
  type: string;
  data?: any;
};

type WebSocketCallbacks = {
  onDoctorAddDelay?: (event: WebSocketEvent) => void;
  onDoctorVisioStart?: (event: WebSocketEvent) => void;
};

class WebSocketService {
  private socket: Socket | null = null;
  private callbacks: WebSocketCallbacks = {};

  constructor(
    private readonly url: string,
    private readonly query: Record<string, string>
  ) {}

  connect(callbacks: WebSocketCallbacks = {}) {
    this.callbacks = callbacks;

    this.socket = io(this.url, {
      path: '/ws',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      query: this.query,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    this.socket.on('message', (event) => {
      if (event.channel === 'teleconsultation:doctor:add-delay') {
        this.callbacks.onDoctorAddDelay?.({
          type: 'teleconsultation:doctor:add-delay',
          data: event.content,
        });
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  send(eventName: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(eventName, data);
    }
  }

  // Méthode pour émettre des événements
  emit(eventName: string, data?: any) {
    this.send(eventName, data);
  }
}

export default WebSocketService;
