import { compare } from "bcryptjs";
import { Router } from "express";
import jwt = require("jsonwebtoken");
import { User } from "../models/User";

const authRouter = Router();
const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

authRouter.post("/register", async (request, response) => {
  const body = request.body as { name?: unknown; email?: unknown; password?: unknown };

  if (typeof body.name !== "string" || typeof body.email !== "string" || typeof body.password !== "string") {
    response.status(400).json({ message: "Name, email, and password are required" });
    return;
  }

  const name = body.name.trim();
  const email = body.email.trim().toLowerCase();
  const password = body.password;

  if (!name || !isValidEmail(email) || password.length < 8) {
    response.status(400).json({ message: "Provide a valid name, email, and password of at least 8 characters" });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    response.status(500).json({ message: "JWT_SECRET is not configured" });
    return;
  }

  try {
    if (await User.exists({ email })) {
      response.status(409).json({ message: "Email is already registered" });
      return;
    }

    const user = await User.create({ name, email, password });
    const token = jwt.sign({ userId: user._id.toString() }, jwtSecret, { expiresIn: "7d" });

    response.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      response.status(409).json({ message: "Email is already registered" });
      return;
    }

    console.error("Registration failed:", error);
    response.status(500).json({ message: "Unable to register user" });
  }
});

authRouter.post("/login", async (request, response) => {
  const body = request.body as { email?: unknown; password?: unknown };

  if (typeof body.email !== "string" || typeof body.password !== "string") {
    response.status(400).json({ message: "Email and password are required" });
    return;
  }

  const email = body.email.trim().toLowerCase();
  if (!isValidEmail(email) || !body.password) {
    response.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    response.status(500).json({ message: "JWT_SECRET is not configured" });
    return;
  }

  try {
    const user = await User.findOne({ email }).select("+password");
    const passwordMatches = user ? await compare(body.password, user.password) : false;

    if (!user || !passwordMatches) {
      response.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign({ userId: user._id.toString() }, jwtSecret, { expiresIn: "7d" });
    response.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);
    response.status(500).json({ message: "Unable to log in" });
  }
});

export default authRouter;
