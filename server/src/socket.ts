import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import jwt = require("jsonwebtoken");
import { User } from "./models/User";

type AuthPayload = jwt.JwtPayload & { userId: string };

const isAuthPayload = (payload: string | jwt.JwtPayload): payload is AuthPayload =>
  typeof payload !== "string" && typeof payload.userId === "string";

export const userSockets = new Map<string, Set<string>>();

export const attachSocketServer = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL ?? "http://127.0.0.1:5173",
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    const jwtSecret = process.env.JWT_SECRET;

    if (typeof token !== "string" || !jwtSecret) {
      next(new Error("Authentication required"));
      return;
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      if (!isAuthPayload(decoded)) {
        next(new Error("Invalid authentication token"));
        return;
      }

      const user = await User.findById(decoded.userId).select("_id");
      if (!user) {
        next(new Error("User no longer exists"));
        return;
      }

      socket.data.userId = user._id.toString();
      next();
    } catch {
      next(new Error("Invalid or expired authentication token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    const sockets = userSockets.get(userId) ?? new Set<string>();
    sockets.add(socket.id);
    userSockets.set(userId, sockets);
    socket.join(`user:${userId}`);

    socket.emit("session:identified", { userId });

    socket.on("disconnect", () => {
      const currentSockets = userSockets.get(userId);
      currentSockets?.delete(socket.id);
      if (currentSockets?.size === 0) {
        userSockets.delete(userId);
      }
    });
  });

  return io;
};
