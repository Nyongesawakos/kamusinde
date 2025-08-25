// src/database/models/Course.model.ts
import mongoose, { Schema, type Document, models, type Model } from "mongoose";

export interface ICourse extends Document {
  courseCode: string;
  name: string;
  description?: string;
  credits: number;
  duration?: string; // e.g., "1 semester", "2 terms"
  level?: string; // e.g., "Beginner", "Intermediate", "Advanced"
  department?: string;
  isActive: boolean;
  syllabus?: string;
  prerequisites?: string[];
  teachers?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema<ICourse> = new Schema(
  {
    courseCode: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    credits: { type: Number, required: true, min: 0 },
    duration: { type: String, trim: true },
    level: { type: String, trim: true },
    department: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    syllabus: { type: String, trim: true },
    prerequisites: [{ type: String, trim: true }],
    teachers: [{ type: Schema.Types.ObjectId, ref: "Teacher" }],
  },
  {
    timestamps: true,
  }
);

// Indexes

CourseSchema.index({ name: 1 });
CourseSchema.index({ department: 1 });

const CourseModel: Model<ICourse> =
  models.Course || mongoose.model<ICourse>("Course", CourseSchema);
export default CourseModel;
