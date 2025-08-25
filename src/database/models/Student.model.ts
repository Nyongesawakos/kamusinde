// src/database/models/Student.model.ts
import mongoose, { Schema, type Document, models, type Model } from "mongoose";
import { IUser } from "./User.model";
// Import User interface

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId | IUser; // Can hold ObjectId or populated User object
  admissionNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: "Male" | "Female" | "Other"; // Use specific strings or Enum
  address?: string;
  parentContact?: string; // Consider a separate Parent model later
  enrollmentDate: Date;
  form: string; // e.g., "Form 1", "Form 4" -> Consider Class relationship instead
  stream?: string; // e.g., "A", "Blue"
  hostel?: string; // Consider Hostel model later

  // Relationships - Add if needed for specific queries/population
  // enrollments?: mongoose.Types.ObjectId[]; // Ref to Enrollment model
  // attendances?: mongoose.Types.ObjectId[]; // Ref to Attendance model
  // grades?: mongoose.Types.ObjectId[]; // Ref to Grade model

  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema<IStudent> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Link to the User model
      required: true,
      unique: true, // One student record per user
    },
    admissionNumber: { type: String, unique: true, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    address: { type: String, trim: true },
    parentContact: { type: String, trim: true },
    enrollmentDate: { type: Date, default: Date.now },
    form: { type: String, required: true, trim: true }, // e.g., "1", "2", "3", "4"
    stream: { type: String, trim: true },
    hostel: { type: String, trim: true },
    // Define refs for relationships if needed for population, e.g.:
    // enrollments: [{ type: Schema.Types.ObjectId, ref: 'Enrollment' }],
  },
  {
    timestamps: true,
  }
);

// Index common query fields
StudentSchema.index({ form: 1, stream: 1 });
StudentSchema.index({ lastName: 1, firstName: 1 });

const StudentModel: Model<IStudent> =
  models.Student || mongoose.model<IStudent>("Student", StudentSchema);
export default StudentModel;
