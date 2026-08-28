import "dotenv/config";
import { createServer } from "node:http";
import app from "./app";
import { connectDB } from "./config/db";
import { attachSocketServer } from "./socket";

const port = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
  } catch (error) {
    console.warn("MongoDB unavailable; starting server without database access.", error);
  }

  const httpServer = createServer(app);
  attachSocketServer(httpServer);
  httpServer.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});
