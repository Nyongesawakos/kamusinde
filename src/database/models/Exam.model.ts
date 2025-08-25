import mongoose, { Schema, type Document } from "mongoose"

export interface IExam extends Document {
  title: string
  description?: string
  examType: string // 'quiz', 'midterm', 'final', etc.
  courseId: mongoose.Types.ObjectId
  classId?: mongoose.Types.ObjectId
  totalMarks: number
  passingMarks: number
  duration: number // in minutes
  examDate: Date
  startTime: string
  endTime: string
  instructions?: string
  status: string // 'scheduled', 'ongoing', 'completed', 'cancelled'
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ExamSchema = new Schema<IExam>(
  {
    title: {
      type: String,
      required: [true, "Exam title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    examType: {
      type: String,
      required: [true, "Exam type is required"],
      enum: ["quiz", "assignment", "midterm", "final", "practical", "other"],
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required for an exam"],
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
    },
    totalMarks: {
      type: Number,
      required: [true, "Total marks are required"],
      min: [0, "Total marks cannot be negative"],
    },
    passingMarks: {
      type: Number,
      required: [true, "Passing marks are required"],
      min: [0, "Passing marks cannot be negative"],
    },
    duration: {
      type: Number,
      required: [true, "Exam duration is required"],
      min: [1, "Duration must be at least 1 minute"],
    },
    examDate: {
      type: Date,
      required: [true, "Exam date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
    },
    instructions: {
      type: String,
    },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
)

export default mongoose.models.Exam || mongoose.model<IExam>("Exam", ExamSchema)
