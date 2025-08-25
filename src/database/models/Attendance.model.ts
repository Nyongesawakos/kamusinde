// src/database/models/Attendance.model.ts
import mongoose, { Schema, type Document, models, type Model } from "mongoose";

export interface IAttendance extends Document {
  student: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  course?: mongoose.Types.ObjectId;
  date: Date;
  status: "present" | "absent" | "late" | "excused";
  remarks?: string;
  markedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema: Schema<IAttendance> = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course" },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["present", "absent", "late", "excused"],
      required: true,
    },
    remarks: { type: String, trim: true },
    markedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
AttendanceSchema.index({ student: 1, date: 1, class: 1 }, { unique: true });
AttendanceSchema.index({ class: 1, date: 1 });
AttendanceSchema.index({ date: 1 });
AttendanceSchema.index({ status: 1 });

const AttendanceModel: Model<IAttendance> =
  models.Attendance ||
  mongoose.model<IAttendance>("Attendance", AttendanceSchema);
export default AttendanceModel;
