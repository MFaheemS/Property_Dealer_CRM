import jwt from "jsonwebtoken";
import { AuthUser } from "@/types";

const COOKIE_NAME = "propvault_token";

export function signToken(payload: AuthUser): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthUser | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    return jwt.verify(token, secret) as AuthUser;
  } catch {
    return null;
  }
}

export const COOKIE_NAME_TOKEN = COOKIE_NAME;

