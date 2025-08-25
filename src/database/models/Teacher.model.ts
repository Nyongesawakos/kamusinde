// src/database/models/Teacher.model.ts
import mongoose, { Schema, type Document, models, type Model } from "mongoose";
import { IUser } from "./User.model";

export interface ITeacher extends Document {
  userId: mongoose.Types.ObjectId | IUser;
  staffId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: "Male" | "Female" | "Other";
  address?: string;
  contactNumber?: string;
  qualification?: string;
  specialization?: string[];
  joiningDate: Date;
  subjects?: string[];
  classes?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema: Schema<ITeacher> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    staffId: { type: String, unique: true, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    address: { type: String, trim: true },
    contactNumber: { type: String, trim: true },
    qualification: { type: String, trim: true },
    specialization: [{ type: String, trim: true }],
    joiningDate: { type: Date, default: Date.now },
    subjects: [{ type: String, trim: true }],
    classes: [{ type: Schema.Types.ObjectId, ref: "Class" }],
  },
  {
    timestamps: true,
  }
);

// Indexes

TeacherSchema.index({ lastName: 1, firstName: 1 });

const TeacherModel: Model<ITeacher> =
  models.Teacher || mongoose.model<ITeacher>("Teacher", TeacherSchema);
export default TeacherModel;
