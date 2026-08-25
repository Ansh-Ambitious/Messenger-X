h
import "dotenv/config";
import app from "./app";
import { connectDB } from "./config/db";

const port = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});
