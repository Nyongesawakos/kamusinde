// src/database/models/Event.model.ts
import mongoose, { Schema, type Document, models, type Model } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  eventType: string; // e.g., "Academic", "Sports", "Cultural", "Meeting"
  organizer?: mongoose.Types.ObjectId;
  participants?: {
    type: "students" | "teachers" | "classes" | "all";
    ids?: mongoose.Types.ObjectId[];
  };
  isPublic: boolean;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  attachments?: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema<IEvent> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, trim: true },
    eventType: { type: String, required: true, trim: true },
    organizer: { type: Schema.Types.ObjectId, ref: "User" },
    participants: {
      type: {
        type: String,
        enum: ["students", "teachers", "classes", "all"],
        required: true,
      },
      ids: [{ type: Schema.Types.ObjectId, refPath: "participants.type" }],
    },
    isPublic: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
      required: true,
    },
    attachments: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
EventSchema.index({ startDate: 1 });
EventSchema.index({ eventType: 1 });
EventSchema.index({ status: 1 });

const EventModel: Model<IEvent> =
  models.Event || mongoose.model<IEvent>("Event", EventSchema);
export default EventModel;
