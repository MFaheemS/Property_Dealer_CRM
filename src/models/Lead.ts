import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { computePriority, computeScore } from "@/lib/utils";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "negotiation"
  | "closed"
  | "lost";

export type LeadPriority = "high" | "medium" | "low";

export interface ILeadDocument extends Document {
  name: string;
  email: string;
  phone: string;
  propertyInterest: string;
  budget: number;
  status: LeadStatus;
  priority: LeadPriority;
  score: number;
  notes: string;
  assignedTo: Types.ObjectId | null;
  followUpDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const PROPERTY_TYPES = [
  "Residential Plot",
  "Commercial Plot",
  "House",
  "Apartment",
  "Farm House",
  "Shop",
  "Office",
] as const;

const LeadSchema = new Schema<ILeadDocument>(
  {
    name: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
      maxlength: [80, "Name cannot exceed 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[0-9\+\-\s]{7,15}$/, "Please provide a valid phone number"],
    },
    propertyInterest: {
      type: String,
      required: [true, "Property interest is required"],
      enum: {
        values: PROPERTY_TYPES,
        message: "Invalid property type",
      },
    },
    budget: {
      type: Number,
      required: [true, "Budget is required"],
      min: [0, "Budget cannot be negative"],
    },
    status: {
      type: String,
      enum: {
        values: ["new", "contacted", "qualified", "negotiation", "closed", "lost"],
        message: "Invalid lead status",
      },
      default: "new",
    },
    // Auto-computed from budget — do not set manually
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "low",
    },
    // Auto-computed from budget — 0-100 score
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    notes: {
      type: String,
      default: "",
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    followUpDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ── Pre-save: auto-score + auto-priority from budget ────────────────────────
LeadSchema.pre("save", function (next) {
  if (this.isModified("budget") || this.isNew) {
    this.priority = computePriority(this.budget);
    this.score    = computeScore(this.budget);
  }
  next();
});

// ── Pre-update: keep score/priority in sync on budget changes ───────────────
LeadSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as Record<string, unknown> & {
    budget?: number;
  };

  if (update?.budget !== undefined) {
    update.priority = computePriority(update.budget);
    update.score    = computeScore(update.budget);
  }

  // Bump updatedAt on every update
  (update as Record<string, unknown>).updatedAt = new Date();
  next();
});

// ── Indexes for common filters ───────────────────────────────────────────────
LeadSchema.index({ status: 1 });
LeadSchema.index({ priority: 1 });
LeadSchema.index({ assignedTo: 1 });
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ followUpDate: 1 });
// Compound: agent dashboard query
LeadSchema.index({ assignedTo: 1, status: 1 });

const Lead: Model<ILeadDocument> =
  mongoose.models.Lead ??
  mongoose.model<ILeadDocument>("Lead", LeadSchema);

export default Lead;
