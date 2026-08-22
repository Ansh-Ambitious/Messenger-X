import express = require("express");
import authRouter from "./routes/auth";
import privateRouter from "./routes/private";

const app = express();

app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api", privateRouter);

export default app;
