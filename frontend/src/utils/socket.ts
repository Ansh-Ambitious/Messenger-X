import { io, type Socket } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:5000';

export const createSocket = (token: string): Socket =>
  io(socketUrl, {
    auth: { token },
    autoConnect: true,
  });
