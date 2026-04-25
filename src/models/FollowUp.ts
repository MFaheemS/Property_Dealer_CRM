import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Agents schedule follow-up reminders on leads.
 * The dashboard highlights overdue (scheduledAt < now, isDone = false) entries.
 */

export interface IFollowUpDocument extends Document {
  leadId: Types.ObjectId;
  agentId: Types.ObjectId;
  scheduledAt: Date;
  note: string;
  isDone: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpSchema = new Schema<IFollowUpDocument>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: [true, "leadId is required"],
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "agentId is required"],
    },
    scheduledAt: {
      type: Date,
      required: [true, "Scheduled date is required"],
    },
    note: {
      type: String,
      default: "",
      maxlength: [500, "Note cannot exceed 500 characters"],
      trim: true,
    },
    isDone: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
// Agent's upcoming follow-ups ordered by date
FollowUpSchema.index({ agentId: 1, scheduledAt: 1 });
// All follow-ups for a lead
FollowUpSchema.index({ leadId: 1 });
// Dashboard: find overdue (isDone=false, scheduledAt < now)
FollowUpSchema.index({ isDone: 1, scheduledAt: 1 });

const FollowUp: Model<IFollowUpDocument> =
  mongoose.models.FollowUp ??
  mongoose.model<IFollowUpDocument>("FollowUp", FollowUpSchema);

export default FollowUp;
