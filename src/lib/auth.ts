import jwt from "jsonwebtoken";
import { AuthUser } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET as string;
const COOKIE_NAME = "propvault_token";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export function signToken(payload: AuthUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export const COOKIE_NAME_TOKEN = COOKIE_NAME;

