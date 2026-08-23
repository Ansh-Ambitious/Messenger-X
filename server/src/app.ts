import express = require("express");
import authRouter from "./routes/auth";
import chatRouter from "./routes/chatRoutes";
import privateRouter from "./routes/private";

const app = express();

app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api", chatRouter);
app.use("/api", privateRouter);

export default app;
