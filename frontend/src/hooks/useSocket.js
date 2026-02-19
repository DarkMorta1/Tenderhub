import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = (userId) => {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { autoConnect: !!userId });
    socketRef.current = socket;

    if (userId) {
      socket.emit('identify', userId);
    }

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return socketRef;
};

