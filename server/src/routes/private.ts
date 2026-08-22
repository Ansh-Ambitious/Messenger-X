import { Router } from "express";
import { Types } from "mongoose";
import { Conversation } from "../models/Conversation";
import { User } from "../models/User";
import { authMiddleware } from "../middleware/authMiddleware";

const privateRouter = Router();
const notImplemented = (_request: unknown, response: { status: (code: number) => { json: (body: object) => void } }): void => {
  response.status(501).json({ message: "This endpoint is not implemented yet" });
};

privateRouter.get("/users", authMiddleware, notImplemented);
privateRouter.get("/chats", authMiddleware, notImplemented);
privateRouter.get("/chats/:id/messages", authMiddleware, notImplemented);
privateRouter.post("/chats", authMiddleware, async (request, response) => {
  const body = request.body as { participantId?: unknown };
  const currentUser = request.user;

  if (!currentUser || typeof body.participantId !== "string" || !Types.ObjectId.isValid(body.participantId)) {
    response.status(400).json({ message: "A valid participantId is required" });
    return;
  }

  const participantId = new Types.ObjectId(body.participantId);
  if (participantId.equals(currentUser._id)) {
    response.status(400).json({ message: "A conversation requires two different users" });
    return;
  }

  if (!(await User.exists({ _id: participantId }))) {
    response.status(404).json({ message: "Participant not found" });
    return;
  }

  const participants = [currentUser._id, participantId].sort((left, right) =>
    left.toString().localeCompare(right.toString()),
  ) as [Types.ObjectId, Types.ObjectId];
  const participantKey = participants.map(String).join(":");

  try {
    const existingConversation = await Conversation.findOne({ participantKey });
    if (existingConversation) {
      response.status(200).json(existingConversation);
      return;
    }

    const conversation = await Conversation.create({ participants, participantKey });
    response.status(201).json(conversation);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      const existingConversation = await Conversation.findOne({ participantKey });
      response.status(200).json(existingConversation);
      return;
    }

    console.error("Conversation creation failed:", error);
    response.status(500).json({ message: "Unable to create conversation" });
  }
});

export default privateRouter;
