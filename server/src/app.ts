import express = require("express");
import cors = require("cors");
import authRouter from "./routes/auth";
import chatRouter from "./routes/chatRoutes";
import privateRouter from "./routes/private";

const app = express();

app.use(
	cors({
		origin: process.env.FRONTEND_URL ?? "http://127.0.0.1:5173",
		credentials: true,
	}),
);
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api", chatRouter);
app.use("/api", privateRouter);

export default app;
