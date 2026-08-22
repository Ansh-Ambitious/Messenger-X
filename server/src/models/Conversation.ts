import { model, Schema, Types } from "mongoose";

export interface IConversation {
  participants: [Types.ObjectId, Types.ObjectId];
  participantKey: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      required: true,
      validate: {
        validator: (participants: Types.ObjectId[]) =>
          participants.length === 2 && new Set(participants.map(String)).size === 2,
        message: "A conversation must contain exactly two distinct users",
      },
    },
    participantKey: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
    lastMessage: {
      type: String,
      trim: true,
    },
    lastMessageAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

conversationSchema.pre("validate", function () {
  if (this.participants?.length === 2) {
    this.participantKey = this.participants.map(String).sort().join(":");
  }
});

export const Conversation = model<IConversation>("Conversation", conversationSchema);
