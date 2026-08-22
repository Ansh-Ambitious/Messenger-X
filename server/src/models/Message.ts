import { model, Schema, Types } from "mongoose";

export type MessageStatus = "sent" | "delivered" | "read";

export interface IMessage {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  content: string;
  status: MessageStatus;
  createdAt: Date;
  readAt?: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: false },
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = model<IMessage>("Message", messageSchema);
