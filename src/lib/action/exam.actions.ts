"use server"

import { revalidatePath } from "next/cache"
import { connectToDatabase } from "@/lib/mongoose"
import Exam from "@/database/models/Exam.model"
import ExamResult from "@/database/models/ExamResult.model"
import Course from "@/database/models/Course.model"
import Class from "@/database/models/Class.model"
import Student from "@/database/models/Student.model"
import mongoose from "mongoose"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Create a new exam
export async function createExam(formData: FormData) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new Error("Unauthorized")
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const examType = formData.get("examType") as string
    const courseId = formData.get("courseId") as string
    const classId = formData.get("classId") as string
    const totalMarks = Number.parseInt(formData.get("totalMarks") as string)
    const passingMarks = Number.parseInt(formData.get("passingMarks") as string)
    const duration = Number.parseInt(formData.get("duration") as string)
    const examDate = new Date(formData.get("examDate") as string)
    const startTime = formData.get("startTime") as string
    const endTime = formData.get("endTime") as string
    const instructions = formData.get("instructions") as string
    const status = (formData.get("status") as string) || "scheduled"

    // Validate required fields
    if (
      !title ||
      !examType ||
      !courseId ||
      !totalMarks ||
      !passingMarks ||
      !duration ||
      !examDate ||
      !startTime ||
      !endTime
    ) {
      throw new Error("Missing required fields")
    }

    // Get user ID from session
    const userId = session.user.id

    // Create new exam
    const newExam = await Exam.create({
      title,
      description,
      examType,
      courseId: new mongoose.Types.ObjectId(courseId),
      ...(classId && { classId: new mongoose.Types.ObjectId(classId) }),
      totalMarks,
      passingMarks,
      duration,
      examDate,
      startTime,
      endTime,
      instructions,
      status,
      createdBy: new mongoose.Types.ObjectId(userId),
    })

    revalidatePath("/dashboard/exams")
    return { success: true, examId: newExam._id }
  } catch (error: any) {
    console.error("Error creating exam:", error)
    return { success: false, error: error.message }
  }
}

// Get all exams with pagination
export async function getExams(page = 1, limit = 10, filters = {}) {
  try {
    await connectToDatabase()

    const skip = (page - 1) * limit

    const exams = await Exam.find(filters)
      .populate("courseId", "name code")
      .populate("classId", "name academicYear")
      .populate("createdBy", "name")
      .sort({ examDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const totalExams = await Exam.countDocuments(filters)

    return {
      success: true,
      exams,
      totalPages: Math.ceil(totalExams / limit),
      currentPage: page,
      totalExams,
    }
  } catch (error: any) {
    console.error("Error fetching exams:", error)
    return { success: false, error: error.message }
  }
}

// Get a single exam by ID
export async function getExamById(examId: string) {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      throw new Error("Invalid exam ID")
    }

    const exam = await Exam.findById(examId)
      .populate("courseId", "name code")
      .populate("classId", "name academicYear")
      .populate("createdBy", "name")
      .lean()

    if (!exam) {
      throw new Error("Exam not found")
    }

    return { success: true, exam }
  } catch (error: any) {
    console.error("Error fetching exam:", error)
    return { success: false, error: error.message }
  }
}

// Update an exam
export async function updateExam(examId: string, formData: FormData) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new Error("Unauthorized")
    }

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      throw new Error("Invalid exam ID")
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const examType = formData.get("examType") as string
    const courseId = formData.get("courseId") as string
    const classId = formData.get("classId") as string
    const totalMarks = Number.parseInt(formData.get("totalMarks") as string)
    const passingMarks = Number.parseInt(formData.get("passingMarks") as string)
    const duration = Number.parseInt(formData.get("duration") as string)
    const examDate = new Date(formData.get("examDate") as string)
    const startTime = formData.get("startTime") as string
    const endTime = formData.get("endTime") as string
    const instructions = formData.get("instructions") as string
    const status = formData.get("status") as string

    // Validate required fields
    if (
      !title ||
      !examType ||
      !courseId ||
      !totalMarks ||
      !passingMarks ||
      !duration ||
      !examDate ||
      !startTime ||
      !endTime ||
      !status
    ) {
      throw new Error("Missing required fields")
    }

    // Update exam
    const updatedExam = await Exam.findByIdAndUpdate(
      examId,
      {
        title,
        description,
        examType,
        courseId: new mongoose.Types.ObjectId(courseId),
        ...(classId ? { classId: new mongoose.Types.ObjectId(classId) } : { classId: null }),
        totalMarks,
        passingMarks,
        duration,
        examDate,
        startTime,
        endTime,
        instructions,
        status,
      },
      { new: true },
    )

    if (!updatedExam) {
      throw new Error("Exam not found")
    }

    revalidatePath(`/dashboard/exams/${examId}`)
    revalidatePath("/dashboard/exams")

    return { success: true, exam: updatedExam }
  } catch (error: any) {
    console.error("Error updating exam:", error)
    return { success: false, error: error.message }
  }
}

// Delete an exam
export async function deleteExam(examId: string) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new Error("Unauthorized")
    }

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      throw new Error("Invalid exam ID")
    }

    // Check if there are any results for this exam
    const hasResults = await ExamResult.exists({ examId: new mongoose.Types.ObjectId(examId) })

    if (hasResults) {
      throw new Error("Cannot delete exam with existing results. Delete the results first.")
    }

    const deletedExam = await Exam.findByIdAndDelete(examId)

    if (!deletedExam) {
      throw new Error("Exam not found")
    }

    revalidatePath("/dashboard/exams")

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting exam:", error)
    return { success: false, error: error.message }
  }
}

// Record exam result
export async function recordExamResult(formData: FormData) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new Error("Unauthorized")
    }

    const examId = formData.get("examId") as string
    const studentId = formData.get("studentId") as string
    const marksObtained = Number.parseFloat(formData.get("marksObtained") as string)
    const status = formData.get("status") as string
    const feedback = formData.get("feedback") as string

    // Validate required fields
    if (!examId || !studentId || marksObtained === undefined || !status) {
      throw new Error("Missing required fields")
    }

    // Get user ID from session
    const userId = session.user.id

    // Get exam details to check total marks
    const exam = await Exam.findById(examId)
    if (!exam) {
      throw new Error("Exam not found")
    }

    // Validate marks
    if (marksObtained < 0 || marksObtained > exam.totalMarks) {
      throw new Error(`Marks must be between 0 and ${exam.totalMarks}`)
    }

    // Check if result already exists
    const existingResult = await ExamResult.findOne({
      examId: new mongoose.Types.ObjectId(examId),
      studentId: new mongoose.Types.ObjectId(studentId),
    })

    let result

    if (existingResult) {
      // Update existing result
      result = await ExamResult.findByIdAndUpdate(
        existingResult._id,
        {
          marksObtained,
          status,
          feedback,
          gradedBy: new mongoose.Types.ObjectId(userId),
          gradedAt: new Date(),
        },
        { new: true },
      )
    } else {
      // Create new result
      result = await ExamResult.create({
        examId: new mongoose.Types.ObjectId(examId),
        studentId: new mongoose.Types.ObjectId(studentId),
        marksObtained,
        status,
        feedback,
        submittedAt: new Date(),
        gradedBy: new mongoose.Types.ObjectId(userId),
        gradedAt: new Date(),
      })
    }

    revalidatePath(`/dashboard/exams/${examId}/results`)

    return { success: true, result }
  } catch (error: any) {
    console.error("Error recording exam result:", error)
    return { success: false, error: error.message }
  }
}

// Get exam results
export async function getExamResults(examId: string) {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      throw new Error("Invalid exam ID")
    }

    // Get exam details
    const exam = await Exam.findById(examId).populate("courseId", "name code").populate("classId", "name").lean()

    if (!exam) {
      throw new Error("Exam not found")
    }

    // Get all results for this exam
    const results = await ExamResult.find({ examId: new mongoose.Types.ObjectId(examId) })
      .populate("studentId", "firstName lastName registrationNumber")
      .populate("gradedBy", "name")
      .lean()

    // Get students who should take this exam (based on class if specified, otherwise all students taking the course)
    let eligibleStudents
    if (exam.classId) {
      eligibleStudents = await Student.find({ classId: exam.classId })
        .select("_id firstName lastName registrationNumber")
        .lean()
    } else {
      // This is simplified - in a real system, you'd need to track course enrollments
      eligibleStudents = await Student.find({}).select("_id firstName lastName registrationNumber").lean()
    }

    // Map results to students
    const studentsWithResults = eligibleStudents.map((student: any) => {
      const studentResult = results.find((r: any) => r.studentId._id.toString() === student._id.toString())

      return {
        student,
        result: studentResult || null,
      }
    })

    // Calculate statistics
    const totalStudents = eligibleStudents.length
    const totalSubmitted = results.length
    const totalPassed = results.filter((r: any) => r.status === "pass").length
    const totalFailed = results.filter((r: any) => r.status === "fail").length
    const totalAbsent = results.filter((r: any) => r.status === "absent").length
    const totalIncomplete = results.filter((r: any) => r.status === "incomplete").length

    const highestMarks = results.length > 0 ? Math.max(...results.map((r: any) => r.marksObtained)) : 0

    const lowestMarks = results.length > 0 ? Math.min(...results.map((r: any) => r.marksObtained)) : 0

    const averageMarks =
      results.length > 0 ? results.reduce((sum: number, r: any) => sum + r.marksObtained, 0) / results.length : 0

    return {
      success: true,
      exam,
      studentsWithResults,
      statistics: {
        totalStudents,
        totalSubmitted,
        totalPassed,
        totalFailed,
        totalAbsent,
        totalIncomplete,
        highestMarks,
        lowestMarks,
        averageMarks: Number.parseFloat(averageMarks.toFixed(2)),
        passRate: totalSubmitted > 0 ? Number.parseFloat(((totalPassed / totalSubmitted) * 100).toFixed(2)) : 0,
      },
    }
  } catch (error: any) {
    console.error("Error fetching exam results:", error)
    return { success: false, error: error.message }
  }
}

// Delete exam result
export async function deleteExamResult(resultId: string) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new Error("Unauthorized")
    }

    if (!mongoose.Types.ObjectId.isValid(resultId)) {
      throw new Error("Invalid result ID")
    }

    const result = await ExamResult.findById(resultId)
    if (!result) {
      throw new Error("Result not found")
    }

    const examId = result.examId

    await ExamResult.findByIdAndDelete(resultId)

    revalidatePath(`/dashboard/exams/${examId}/results`)

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting exam result:", error)
    return { success: false, error: error.message }
  }
}

// Get courses and classes for form selection
export async function getExamFormData() {
  try {
    await connectToDatabase()

    const courses = await Course.find({}).select("_id name code").sort({ name: 1 }).lean()

    const classes = await Class.find({}).select("_id name academicYear").sort({ academicYear: -1, name: 1 }).lean()

    return {
      success: true,
      courses,
      classes,
    }
  } catch (error: any) {
    console.error("Error fetching form data:", error)
    return { success: false, error: error.message }
  }
}

// Get student results for a specific exam
export async function getStudentExamResults(studentId: string) {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      throw new Error("Invalid student ID")
    }

    const results = await ExamResult.find({ studentId: new mongoose.Types.ObjectId(studentId) })
      .populate({
        path: "examId",
        select: "title examType totalMarks passingMarks examDate courseId",
        populate: {
          path: "courseId",
          select: "name code",
        },
      })
      .sort({ "examId.examDate": -1 })
      .lean()

    return {
      success: true,
      results,
    }
  } catch (error: any) {
    console.error("Error fetching student exam results:", error)
    return { success: false, error: error.message }
  }
}
