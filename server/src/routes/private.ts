import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";

const privateRouter = Router();
const notImplemented = (_request: unknown, response: { status: (code: number) => { json: (body: object) => void } }): void => {
  response.status(501).json({ message: "This endpoint is not implemented yet" });
};

privateRouter.get("/users", authMiddleware, notImplemented);

export default privateRouter;
