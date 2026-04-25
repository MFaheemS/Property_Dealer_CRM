import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { signToken } from "@/lib/auth";
import { AuthUser } from "@/types";

interface SignupInput {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "agent";
}

interface LoginInput {
  email: string;
  password: string;
}

export async function signup(input: SignupInput) {
  await connectDB();

  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) throw new Error("An account with this email already exists");

  const user = await User.create({
    name:     input.name.trim(),
    email:    input.email.toLowerCase().trim(),
    password: input.password,
    role:     input.role ?? "agent",
  });

  const payload: AuthUser = {
    id:    user._id.toString(),
    name:  user.name,
    email: user.email,
    role:  user.role,
  };

  return { user: user.toJSON(), token: signToken(payload) };
}

export async function login(input: LoginInput) {
  await connectDB();

  // Explicitly select password (excluded by default via select:false)
  const user = await User.findOne({ email: input.email.toLowerCase() }).select("+password");
  if (!user) throw new Error("Invalid email or password");

  const valid = await user.comparePassword(input.password);
  if (!valid) throw new Error("Invalid email or password");

  const payload: AuthUser = {
    id:    user._id.toString(),
    name:  user.name,
    email: user.email,
    role:  user.role,
  };

  return { user: user.toJSON(), token: signToken(payload) };
}

export async function getUserById(id: string) {
  await connectDB();
  return User.findById(id).lean();
}

export async function getAllAgents() {
  await connectDB();
  return User.find({ role: "agent" })
    .select("name email avatar role createdAt")
    .sort({ name: 1 })
    .lean();
}
