import { io, Socket } from 'socket.io-client';

// Create socket instance with proper typing
const socket: Socket = io('http://localhost:8080', {
  transports: ['polling', 'websocket'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  timeout: 20000,
  path: '/socket.io'
});

// Connection event handlers
socket.on('connect', () => {
  console.log('Connected to server');
  // Start polling automatically when connected
  socket.emit('startPolling');
});

socket.on('connect_error', (error: Error) => {
  console.error('Connection error:', error);
});

socket.on('disconnect', (reason: string) => {
  console.log('Disconnected:', reason);
});

// Add specific event listener for KPI updates
socket.on('kpiUpdate', (data) => {
  console.log('Received KPI update:', data);
});

// Export the socket instance
export { socket }; 