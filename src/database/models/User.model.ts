// src/database/models/User.model.ts
import { UserRole } from "@/types";
import mongoose, { Schema, type Document, models, type Model } from "mongoose";

// Keep enum definition here or move to a shared types file if preferred

export interface IUser extends Document {
  name?: string | null; // Allow null for providers that don't return name
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  password?: string | null; // Hashed password
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  // NextAuth adapter fields (managed by adapter)
  accounts?: mongoose.Types.ObjectId[];
  sessions?: mongoose.Types.ObjectId[];
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String },
    // Use sparse index for email to allow multiple null values if needed, but ensure uniqueness for actual emails
    email: { type: String, unique: true, sparse: true },
    emailVerified: { type: Date },
    image: { type: String },
    // IMPORTANT: Exclude password from default query results
    password: { type: String, select: false },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STUDENT,
      required: true,
    },
    // --- NextAuth fields - define refs for potential population if needed elsewhere ---
    accounts: [{ type: Schema.Types.ObjectId, ref: "Account" }],
    sessions: [{ type: Schema.Types.ObjectId, ref: "Session" }],
  },
  {
    timestamps: true,
  }
);

// Ensure email index handles nulls correctly if email is not always required
// UserSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: "string" } } });

const UserModel: Model<IUser> =
  models.User || mongoose.model<IUser>("User", UserSchema);

export default UserModel;
