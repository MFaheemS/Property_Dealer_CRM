import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type NotificationType =
  | "lead_created"
  | "lead_assigned"
  | "status_changed"
  | "followup_due";

export interface INotificationDocument extends Document {
  userId:   Types.ObjectId;
  type:     NotificationType;
  title:    string;
  message:  string;
  leadId?:  Types.ObjectId;
  isRead:   boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId:  { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type:    { type: String, required: true },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    leadId:  { type: Schema.Types.ObjectId, ref: "Lead", default: null },
    isRead:  { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

const Notification: Model<INotificationDocument> =
  mongoose.models.Notification ??
  mongoose.model<INotificationDocument>("Notification", NotificationSchema);

export default Notification;
