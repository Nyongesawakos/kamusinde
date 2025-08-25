// src/database/models/Fee.model.ts
import mongoose, { Schema, type Document, models, type Model } from "mongoose";

export interface IFee extends Document {
  student: mongoose.Types.ObjectId;
  academicYear: string;
  term: string;
  feeType: string; // e.g., "Tuition", "Boarding", "Activity", "Library"
  amount: number;
  dueDate: Date;
  status: "paid" | "partial" | "unpaid" | "waived";
  paidAmount: number;
  balance: number;
  paymentDate?: Date;
  paymentMethod?: string; // e.g., "Cash", "Bank Transfer", "Mobile Money"
  transactionId?: string;
  receiptNumber?: string;
  remarks?: string;
  recordedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FeeSchema: Schema<IFee> = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    academicYear: { type: String, required: true, trim: true },
    term: { type: String, required: true, trim: true },
    feeType: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["paid", "partial", "unpaid", "waived"],
      default: "unpaid",
      required: true,
    },
    paidAmount: { type: Number, default: 0, min: 0 },
    balance: { type: Number, min: 0 },
    paymentDate: { type: Date },
    paymentMethod: { type: String, trim: true },
    transactionId: { type: String, trim: true },
    receiptNumber: { type: String, trim: true },
    remarks: { type: String, trim: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
FeeSchema.index(
  { student: 1, academicYear: 1, term: 1, feeType: 1 },
  { unique: true }
);
FeeSchema.index({ status: 1 });
FeeSchema.index({ dueDate: 1 });

const FeeModel: Model<IFee> =
  models.Fee || mongoose.model<IFee>("Fee", FeeSchema);
export default FeeModel;
