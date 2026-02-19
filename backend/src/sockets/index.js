import { Server } from 'socket.io';
import { ENV } from '../config/env.js';

const ACTIVE_USERS = new Map(); // socketId -> userId

export const initSockets = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: ENV.SOCKET_IO_CORS_ORIGIN,
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    socket.on('identify', (userId) => {
      ACTIVE_USERS.set(socket.id, userId);
    });

    socket.on('joinRequirementRoom', (requirementId) => {
      socket.join(`requirement:${requirementId}`);
    });

    socket.on('chatMessage', ({ requirementId, from, to, message }) => {
      io.to(`requirement:${requirementId}`).emit('chatMessage', {
        requirementId,
        from,
        to,
        message,
        createdAt: new Date().toISOString()
      });
    });

    socket.on('disconnect', () => {
      ACTIVE_USERS.delete(socket.id);
    });
  });

  const emitBidUpdated = (requirementId, bid) => {
    io.to(`requirement:${requirementId}`).emit('bidUpdated', bid);
  };

  const emitNotificationToUser = (userId, notification) => {
    for (const [socketId, uid] of ACTIVE_USERS.entries()) {
      if (uid === String(userId)) {
        io.to(socketId).emit('notification', notification);
      }
    }
  };

  return {
    io,
    emitBidUpdated,
    emitNotificationToUser
  };
};

