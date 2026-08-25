import "dotenv/config";
import app from "./app";
import { connectDB } from "./config/db";

const port = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
  } catch (error) {
    console.warn("MongoDB unavailable; starting server without database access.", error);
  }

  app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});
