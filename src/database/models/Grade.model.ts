// src/database/models/Grade.model.ts
import mongoose, { Schema, type Document, models, type Model } from "mongoose";

export interface IGrade extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  academicYear: string;
  term: string; // e.g., "Term 1", "Semester 2"
  examType: string; // e.g., "Midterm", "Final", "Quiz", "Assignment"
  score: number;
  maxScore: number;
  percentage?: number;
  grade?: string; // e.g., "A", "B+", "C"
  remarks?: string;
  gradedBy: mongoose.Types.ObjectId;
  gradedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GradeSchema: Schema<IGrade> = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    academicYear: { type: String, required: true, trim: true },
    term: { type: String, required: true, trim: true },
    examType: { type: String, required: true, trim: true },
    score: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, required: true, min: 0 },
    percentage: { type: Number, min: 0, max: 100 },
    grade: { type: String, trim: true },
    remarks: { type: String, trim: true },
    gradedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    gradedDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes
GradeSchema.index(
  { student: 1, course: 1, term: 1, examType: 1 },
  { unique: true }
);
GradeSchema.index({ class: 1, course: 1 });
GradeSchema.index({ academicYear: 1, term: 1 });

const GradeModel: Model<IGrade> =
  models.Grade || mongoose.model<IGrade>("Grade", GradeSchema);
export default GradeModel;
