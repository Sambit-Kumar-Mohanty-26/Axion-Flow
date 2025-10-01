import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

const SOCKET_URL = 'http://localhost:3001';

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const socket = useMemo(() => io(SOCKET_URL), []);

  useEffect(() => {
    socket.on('connect', () => console.log('🔌 WebSocket connected!'));
    socket.on('disconnect', () => console.log('❌ WebSocket disconnected.'));

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return socket;
};