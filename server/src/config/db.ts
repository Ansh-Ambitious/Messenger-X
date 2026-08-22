import "dotenv/config";
import { connect } from "mongoose";

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined");
  }

  await connect(mongoUri);
  console.log("MongoDB connected successfully");
};
