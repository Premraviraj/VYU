import { io, Socket } from 'socket.io-client';
import { API_URL } from './utils/config';

// Create socket instance with proper typing and error handling
const socket: Socket = io(API_URL, {
  transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
  path: '/socket.io'
});

// Enhanced error handling
socket.on('connect_error', (error: Error) => {
  console.warn('Socket connection error:', error);
  // Type-safe way to modify transport
  socket.io.opts = {
    ...socket.io.opts,
    transports: ['polling']
  };
});

socket.on('connect', () => {
  console.log('Connected to server');
  socket.emit('startPolling');
});

socket.on('disconnect', (reason: string) => {
  console.log('Disconnected:', reason);
  if (reason === 'transport close' || reason === 'transport error') {
    // Try to reconnect with different transport
    socket.connect();
  }
});

socket.on('reconnect_attempt', () => {
  console.log('Attempting to reconnect...');
});

socket.on('kpiUpdate', (data) => {
  console.log('Received KPI update:', data);
});

export { socket }; 