import { Types } from "mongoose";

export const sanitizeText = (value: unknown, maxLength = 2000): string => {
  if (typeof value !== "string") {
    return "";
  }

  const normalized = value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[\u0000-\u001F\u007F]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return normalized.slice(0, maxLength);
};

export const isValidObjectId = (value: unknown): value is string =>
  typeof value === "string" && Types.ObjectId.isValid(value);

export const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const isStrongPassword = (value: string): boolean => {
  if (value.length < 8 || value.length > 128) {
    return false;
  }

  const banned = ["password123", "password", "welcome", "qwerty", "admin"];
  const normalized = value.toLowerCase();
  return /^(?=.*[a-z])(?=.*\d)(?=.*[A-Z])/.test(value) && !banned.some((entry) => normalized.includes(entry));
};
