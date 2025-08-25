// src/database/models/Class.model.ts
import mongoose, { Schema, type Document, models, type Model } from "mongoose";

export interface IClass extends Document {
  name: string; // e.g., "Form 1A", "Grade 10B"
  academicYear: string; // e.g., "2023-2024"
  form: string; // e.g., "Form 1", "Form 2"
  stream?: string; // e.g., "A", "B", "Blue", "Red"
  classTeacher?: mongoose.Types.ObjectId;
  students?: mongoose.Types.ObjectId[];
  courses?: mongoose.Types.ObjectId[];
  schedule?: {
    day: string;
    startTime: string;
    endTime: string;
    room?: string;
  }[];
  capacity?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema: Schema<IClass> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true, trim: true },
    form: { type: String, required: true, trim: true },
    stream: { type: String, trim: true },
    classTeacher: { type: Schema.Types.ObjectId, ref: "Teacher" },
    students: [{ type: Schema.Types.ObjectId, ref: "Student" }],
    courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    schedule: [
      {
        day: { type: String, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        room: { type: String },
      },
    ],
    capacity: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
ClassSchema.index({ name: 1, academicYear: 1 }, { unique: true });
ClassSchema.index({ form: 1, stream: 1 });
ClassSchema.index({ academicYear: 1 });

const ClassModel: Model<IClass> =
  models.Class || mongoose.model<IClass>("Class", ClassSchema);
export default ClassModel;
