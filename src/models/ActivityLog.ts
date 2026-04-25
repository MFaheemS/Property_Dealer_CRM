import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Every meaningful action on a lead is recorded here.
 * This powers the per-lead activity timeline in the UI.
 */

export type ActivityAction =
  | "lead_created"
  | "lead_updated"
  | "lead_assigned"
  | "status_changed"
  | "note_added"
  | "followup_set"
  | "followup_completed"
  | "lead_deleted";

export interface IActivityLogDocument extends Document {
  leadId: Types.ObjectId;
  action: ActivityAction;
  performedBy: Types.ObjectId;
  /**
   * Flexible metadata — e.g. { from: "new", to: "contacted" } for status changes,
   * or { agentName: "Ali" } for assignment events.
   */
  meta: Record<string, unknown>;
  timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLogDocument>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: [true, "leadId is required"],
    },
    action: {
      type: String,
      required: [true, "action is required"],
      enum: {
        values: [
          "lead_created",
          "lead_updated",
          "lead_assigned",
          "status_changed",
          "note_added",
          "followup_set",
          "followup_completed",
          "lead_deleted",
        ],
        message: "Invalid activity action",
      },
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "performedBy is required"],
    },
    meta: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    // No timestamps: true — we manage `timestamp` ourselves
    // so the timeline is always ordered by this field
    versionKey: false,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
// Primary query: all activity for a lead, newest first
ActivityLogSchema.index({ leadId: 1, timestamp: -1 });
// Admin: filter by who performed the action
ActivityLogSchema.index({ performedBy: 1, timestamp: -1 });

const ActivityLog: Model<IActivityLogDocument> =
  mongoose.models.ActivityLog ??
  mongoose.model<IActivityLogDocument>("ActivityLog", ActivityLogSchema);

export default ActivityLog;
