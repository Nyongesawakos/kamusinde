// src/database/models/DisciplinaryRecord.model.ts
import mongoose, { Schema, type Document, models, type Model } from "mongoose";

export interface IDisciplinaryRecord extends Document {
  student: mongoose.Types.ObjectId;
  date: Date;
  incidentType: string; // e.g., "Misconduct", "Tardiness", "Uniform Violation"
  description: string;
  action: string; // e.g., "Warning", "Detention", "Suspension"
  duration?: string; // e.g., "1 day", "1 week" (for suspensions)
  status: "pending" | "in-progress" | "resolved";
  reportedBy: mongoose.Types.ObjectId;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedDate?: Date;
  parentNotified: boolean;
  parentResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DisciplinaryRecordSchema: Schema<IDisciplinaryRecord> = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    date: { type: Date, required: true },
    incidentType: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    action: { type: String, required: true, trim: true },
    duration: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
      default: "pending",
      required: true,
    },
    reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    resolvedDate: { type: Date },
    parentNotified: { type: Boolean, default: false, required: true },
    parentResponse: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
DisciplinaryRecordSchema.index({ student: 1, date: 1 });
DisciplinaryRecordSchema.index({ status: 1 });
DisciplinaryRecordSchema.index({ incidentType: 1 });

const DisciplinaryRecordModel: Model<IDisciplinaryRecord> =
  models.DisciplinaryRecord ||
  mongoose.model<IDisciplinaryRecord>(
    "DisciplinaryRecord",
    DisciplinaryRecordSchema
  );
export default DisciplinaryRecordModel;
