import { Router } from "express";
import { Types } from "mongoose";
import { authMiddleware } from "../middleware/authMiddleware";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { User } from "../models/User";

const chatRouter = Router();

chatRouter.get("/chats", authMiddleware, async (request, response) => {
  const currentUser = request.user;

  if (!currentUser) {
    response.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const conversations = await Conversation.find({ participants: currentUser._id })
      .populate("participants", "name email avatar isOnline lastSeen")
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    response.json(conversations);
  } catch (error) {
    console.error("Conversation lookup failed:", error);
    response.status(500).json({ message: "Unable to load conversations" });
  }
});

chatRouter.post("/chats", authMiddleware, async (request, response) => {
  const currentUser = request.user;
  const body = request.body as { userId?: unknown };

  if (!currentUser || typeof body.userId !== "string" || !Types.ObjectId.isValid(body.userId)) {
    response.status(400).json({ message: "A valid userId is required" });
    return;
  }

  const participantId = new Types.ObjectId(body.userId);
  if (participantId.equals(currentUser._id)) {
    response.status(400).json({ message: "A conversation requires two different users" });
    return;
  }

  try {
    if (!(await User.exists({ _id: participantId }))) {
      response.status(404).json({ message: "User not found" });
      return;
    }

    const participants = [currentUser._id, participantId].sort((left, right) =>
      left.toString().localeCompare(right.toString()),
    ) as [Types.ObjectId, Types.ObjectId];
    const participantKey = participants.map(String).join(":");
    const existingConversation = await Conversation.findOne({ participantKey });

    if (existingConversation) {
      response.status(200).json(existingConversation);
      return;
    }

    const conversation = await Conversation.create({ participants, participantKey });
    response.status(201).json(conversation);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      const existingConversation = await Conversation.findOne({
        participantKey: [currentUser._id, participantId].map(String).sort().join(":"),
      });
      response.status(200).json(existingConversation);
      return;
    }

    console.error("Conversation creation failed:", error);
    response.status(500).json({ message: "Unable to create conversation" });
  }
});

chatRouter.get("/chats/:conversationId/messages", authMiddleware, async (request, response) => {
  const currentUser = request.user;
  const { conversationId } = request.params;

  if (!currentUser) {
    response.status(401).json({ message: "Authentication required" });
    return;
  }

  if (typeof conversationId !== "string" || !Types.ObjectId.isValid(conversationId)) {
    response.status(400).json({ message: "A valid conversationId is required" });
    return;
  }

  try {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: currentUser._id,
    });

    if (!conversation) {
      response.status(404).json({ message: "Conversation not found" });
      return;
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    response.json(messages);
  } catch (error) {
    console.error("Message lookup failed:", error);
    response.status(500).json({ message: "Unable to load messages" });
  }
});

export default chatRouter;