import { RequestHandler } from "express";
import jwt = require("jsonwebtoken");
import { User } from "../models/User";

interface AuthTokenPayload extends jwt.JwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: InstanceType<typeof User>;
    }
  }
}

const isAuthTokenPayload = (payload: string | jwt.JwtPayload): payload is AuthTokenPayload =>
  typeof payload !== "string" && typeof payload.userId === "string";

export const authMiddleware: RequestHandler = async (request, response, next) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    response.status(500).json({ message: "JWT_SECRET is not configured" });
    return;
  }

  const authorization = request.header("authorization");
  const [scheme, token] = authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    response.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (!isAuthTokenPayload(decoded)) {
      response.status(401).json({ message: "Invalid authentication token" });
      return;
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      response.status(401).json({ message: "User no longer exists" });
      return;
    }

    request.user = user;
    next();
  } catch {
    response.status(401).json({ message: "Invalid or expired authentication token" });
  }
};
