import mongoose, { Schema, type Document } from "mongoose"

export interface IExamResult extends Document {
  examId: mongoose.Types.ObjectId
  studentId: mongoose.Types.ObjectId
  marksObtained: number
  status: string // 'pass', 'fail', 'absent', 'incomplete'
  feedback?: string
  submittedAt?: Date
  gradedBy?: mongoose.Types.ObjectId
  gradedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ExamResultSchema = new Schema<IExamResult>(
  {
    examId: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: [true, "Exam ID is required"],
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
    },
    marksObtained: {
      type: Number,
      required: [true, "Marks obtained are required"],
      min: [0, "Marks cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pass", "fail", "absent", "incomplete"],
      required: [true, "Result status is required"],
    },
    feedback: {
      type: String,
    },
    submittedAt: {
      type: Date,
    },
    gradedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    gradedAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

// Compound index to ensure a student can have only one result per exam
ExamResultSchema.index({ examId: 1, studentId: 1 }, { unique: true })

export default mongoose.models.ExamResult || mongoose.model<IExamResult>("ExamResult", ExamResultSchema)
