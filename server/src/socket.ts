import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import jwt = require("jsonwebtoken");
import { Types } from "mongoose";
import { Conversation } from "./models/Conversation";
import { Message } from "./models/Message";
import { User } from "./models/User";

type AuthPayload = jwt.JwtPayload & { userId: string };

const isAuthPayload = (payload: string | jwt.JwtPayload): payload is AuthPayload =>
  typeof payload !== "string" && typeof payload.userId === "string";

export const userSockets = new Map<string, Set<string>>();

const serializeMessage = (message: InstanceType<typeof Message>) => ({
  id: message._id.toString(),
  conversationId: message.conversationId.toString(),
  senderId: message.senderId.toString(),
  receiverId: message.receiverId.toString(),
  content: message.content,
  status: message.status,
  createdAt: message.createdAt.toISOString(),
});

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

    void User.findByIdAndUpdate(userId, { isOnline: true }).catch((error) => {
      console.error("Unable to update online presence:", error);
    });
    socket.emit("session:identified", { userId });
    io.emit("user_online", { userId });

    socket.on(
      "send_message",
      async (
        payload: { conversationId?: unknown; content?: unknown },
        acknowledge?: (result: { ok: boolean; message?: ReturnType<typeof serializeMessage>; error?: string }) => void,
      ) => {
        const conversationId = payload?.conversationId;
        const content = typeof payload?.content === "string" ? payload.content.trim() : "";

        if (typeof conversationId !== "string" || !Types.ObjectId.isValid(conversationId)) {
          acknowledge?.({ ok: false, error: "A valid conversationId is required" });
          return;
        }

        if (!content || content.length > 2000) {
          acknowledge?.({ ok: false, error: "Message content must be between 1 and 2000 characters" });
          return;
        }

        try {
          const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId,
          });

          if (!conversation) {
            acknowledge?.({ ok: false, error: "Conversation not found" });
            return;
          }

          const receiverId = conversation.participants.find((participant) => participant.toString() !== userId);
          if (!receiverId) {
            acknowledge?.({ ok: false, error: "Conversation recipient not found" });
            return;
          }

          const receiverIsOnline = (userSockets.get(receiverId.toString())?.size ?? 0) > 0;
          const message = await Message.create({
            conversationId: conversation._id,
            senderId: userId,
            receiverId,
            content,
            status: receiverIsOnline ? "delivered" : "sent",
          });

          conversation.lastMessage = content;
          conversation.lastMessageAt = message.createdAt;
          await conversation.save();

          const serializedMessage = serializeMessage(message);
          io.to(`user:${receiverId.toString()}`).emit("receive_message", serializedMessage);
          socket.emit("receive_message", serializedMessage);
          acknowledge?.({ ok: true, message: serializedMessage });
        } catch (error) {
          console.error("Message send failed:", error);
          acknowledge?.({ ok: false, error: "Unable to send message" });
        }
      },
    );

    const findConversationRecipient = async (conversationId: unknown) => {
      if (typeof conversationId !== "string" || !Types.ObjectId.isValid(conversationId)) return null;
      const conversation = await Conversation.findOne({ _id: conversationId, participants: userId });
      if (!conversation) return null;
      const recipient = conversation.participants.find((participant) => participant.toString() !== userId);
      return recipient ? { conversation, recipientId: recipient.toString() } : null;
    };

    socket.on("typing", async (payload: { conversationId?: unknown }) => {
      const result = await findConversationRecipient(payload?.conversationId);
      if (result) {
        io.to(`user:${result.recipientId}`).emit("typing", {
          conversationId: result.conversation._id.toString(),
          userId,
        });
      }
    });

    socket.on("stop_typing", async (payload: { conversationId?: unknown }) => {
      const result = await findConversationRecipient(payload?.conversationId);
      if (result) {
        io.to(`user:${result.recipientId}`).emit("stop_typing", {
          conversationId: result.conversation._id.toString(),
          userId,
        });
      }
    });

    socket.on(
      "message_delivered",
      async (payload: { messageId?: unknown }, acknowledge?: (result: { ok: boolean; error?: string }) => void) => {
        if (typeof payload?.messageId !== "string" || !Types.ObjectId.isValid(payload.messageId)) {
          acknowledge?.({ ok: false, error: "A valid messageId is required" });
          return;
        }

        const message = await Message.findOneAndUpdate(
          { _id: payload.messageId, receiverId: userId, status: "sent" },
          { status: "delivered" },
          { new: true },
        );
        if (!message) {
          acknowledge?.({ ok: false, error: "Message not found" });
          return;
        }

        io.to(`user:${message.senderId.toString()}`).emit("message_delivered", {
          messageId: message._id.toString(),
          conversationId: message.conversationId.toString(),
        });
        acknowledge?.({ ok: true });
      },
    );

    socket.on(
      "message_read",
      async (payload: { messageId?: unknown }, acknowledge?: (result: { ok: boolean; error?: string }) => void) => {
        if (typeof payload?.messageId !== "string" || !Types.ObjectId.isValid(payload.messageId)) {
          acknowledge?.({ ok: false, error: "A valid messageId is required" });
          return;
        }

        const message = await Message.findOneAndUpdate(
          { _id: payload.messageId, receiverId: userId },
          { status: "read", readAt: new Date() },
          { new: true },
        );
        if (!message) {
          acknowledge?.({ ok: false, error: "Message not found" });
          return;
        }

        io.to(`user:${message.senderId.toString()}`).emit("message_read", {
          messageId: message._id.toString(),
          conversationId: message.conversationId.toString(),
          readAt: message.readAt?.toISOString(),
        });
        acknowledge?.({ ok: true });
      },
    );

    socket.on("disconnect", () => {
      const currentSockets = userSockets.get(userId);
      currentSockets?.delete(socket.id);
      if (currentSockets?.size === 0) {
        userSockets.delete(userId);
        void User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() }).catch((error) => {
          console.error("Unable to update offline presence:", error);
        });
        io.emit("user_offline", { userId });
      }
    });
  });

  return io;
};
