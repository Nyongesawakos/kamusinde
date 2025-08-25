"use server"

import { connectToDatabase } from "../mongoose"
import AttendanceModel from "@/database/models/Attendance.model"
import StudentModel from "@/database/models/Student.model"
import ClassModel from "@/database/models/Class.model"
import { getServerSession } from "../auth"
import { UserRole } from "@/types"
import mongoose from "mongoose"

// --- Types for Action Results ---
interface ActionResult {
  success: boolean
  message: string
  data?: any
  error?: string | null
}

// --- Check Authorization ---
async function checkAuthorization(allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.STAFF, UserRole.TEACHER]) {
  const session = await getServerSession()

  // Add type assertion for session.user
  const user = session?.user as { id: string; role: UserRole; name?: string | null; email?: string | null; image?: string | null } | undefined;

  if (!user) {
    return { authorized: false, message: "Not authenticated" }
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      authorized: false,
      message: "Not authorized to perform this action",
    }
  }

  return { authorized: true, userId: user.id }
}

// Helper function to deeply serialize data, converting ObjectIds, Dates, etc.
function serializeData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }
  // Use JSON stringify/parse for a deep clone and serialization
  // This handles ObjectIds, Dates, and other BSON types reasonably well for client-side usage
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.error("Serialization Error:", error);
    // Fallback or handle error appropriately
    return data; // Return original data if serialization fails
  }
}

// --- Get Student Attendance ---
export async function getStudentAttendance(
  studentId: string,
  startDate?: string,
  endDate?: string,
): Promise<ActionResult> {
  // Check authorization
  const auth = await checkAuthorization()
  if (!auth.authorized) {
    return {
      success: false,
      message: auth.message ?? "Authorization failed",
    }
  }

  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return {
        success: false,
        message: "Invalid student ID",
      }
    }

    // Build query
    const query: any = { student: studentId }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) }
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) }
    } else {
      // Default to last 30 days if no date range provided
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      query.date = { $gte: thirtyDaysAgo }
    }

    // Fetch attendance records
    const attendanceRecords = await AttendanceModel.find(query)
      .populate("class", "name")
      .populate("course", "name courseCode")
      .populate("markedBy", "name")
      .sort({ date: -1 })
      .lean()

    // Calculate attendance statistics
    const totalRecords = attendanceRecords.length
    const presentCount = attendanceRecords.filter((record) => record.status === "present").length
    const absentCount = attendanceRecords.filter((record) => record.status === "absent").length
    const lateCount = attendanceRecords.filter((record) => record.status === "late").length
    const excusedCount = attendanceRecords.filter((record) => record.status === "excused").length

    const attendanceRate = totalRecords > 0 ? ((presentCount + lateCount) / totalRecords) * 100 : 0

    // Group attendance by date
    const groupedByDate: Record<string, any[]> = {}

    attendanceRecords.forEach((record) => {
      const dateStr = new Date(record.date).toISOString().split("T")[0]

      if (!groupedByDate[dateStr]) {
        groupedByDate[dateStr] = []
      }

      groupedByDate[dateStr].push(record)
    })

    return {
      success: true,
      message: "Student attendance retrieved successfully",
      data: serializeData({ // Serialize data here
        records: attendanceRecords,
        groupedByDate,
        stats: {
          total: totalRecords,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          excused: excusedCount,
          attendanceRate: Math.round(attendanceRate * 10) / 10, // Round to 1 decimal place
        },
      }) // Removed trailing comma here
    }
  } catch (error) {
    console.error("Get Student Attendance Error:", error)
    return {
      success: false,
      message: "Failed to retrieve student attendance",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// --- Get Student Attendance Summary ---
export async function getStudentAttendanceSummary(studentId: string): Promise<ActionResult> {
  // Check authorization
  const auth = await checkAuthorization()
  if (!auth.authorized) {
    return {
      success: false,
      message: auth.message ?? "Authorization failed",
    }
  }

  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return {
        success: false,
        message: "Invalid student ID",
      }
    }

    // Get current month attendance
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const currentMonthRecords = await AttendanceModel.find({
      student: studentId,
      date: { $gte: startOfMonth },
    }).lean()

    const totalCurrentMonth = currentMonthRecords.length
    const presentCurrentMonth = currentMonthRecords.filter((record) => record.status === "present").length
    const absentCurrentMonth = currentMonthRecords.filter((record) => record.status === "absent").length
    const lateCurrentMonth = currentMonthRecords.filter((record) => record.status === "late").length

    const currentMonthRate =
      totalCurrentMonth > 0 ? ((presentCurrentMonth + lateCurrentMonth) / totalCurrentMonth) * 100 : 0

    // Get previous month attendance
    const startOfPrevMonth = new Date(startOfMonth)
    startOfPrevMonth.setMonth(startOfPrevMonth.getMonth() - 1)

    const endOfPrevMonth = new Date(startOfMonth)
    endOfPrevMonth.setDate(0)
    endOfPrevMonth.setHours(23, 59, 59, 999)

    const prevMonthRecords = await AttendanceModel.find({
      student: studentId,
      date: {
        $gte: startOfPrevMonth,
        $lte: endOfPrevMonth,
      },
    }).lean()

    const totalPrevMonth = prevMonthRecords.length
    const presentPrevMonth = prevMonthRecords.filter((record) => record.status === "present").length
    const latePrevMonth = prevMonthRecords.filter((record) => record.status === "late").length

    const prevMonthRate = totalPrevMonth > 0 ? ((presentPrevMonth + latePrevMonth) / totalPrevMonth) * 100 : 0

    // Determine trend
    let trend = "stable"
    if (currentMonthRate > prevMonthRate + 5) {
      trend = "improving"
    } else if (currentMonthRate < prevMonthRate - 5) {
      trend = "declining"
    }

    // Get recent absences (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentAbsences = await AttendanceModel.find({
      student: studentId,
      date: { $gte: sevenDaysAgo },
      status: "absent",
    })
      .populate("class", "name")
      .sort({ date: -1 })
      .lean()

    return {
      success: true,
      message: "Student attendance summary retrieved successfully",
      data: serializeData({ // Serialize data here
        currentMonth: {
          rate: Math.round(currentMonthRate * 10) / 10,
          total: totalCurrentMonth,
          present: presentCurrentMonth,
          absent: absentCurrentMonth,
          late: lateCurrentMonth,
        },
        previousMonth: {
          rate: Math.round(prevMonthRate * 10) / 10,
          total: totalPrevMonth,
        },
        trend,
        recentAbsences,
      }) // Removed trailing comma here
    }
  } catch (error) {
    console.error("Get Student Attendance Summary Error:", error)
    return {
      success: false,
      message: "Failed to retrieve student attendance summary",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// --- Get Class Attendance ---
export async function getClassAttendance(classId: string, date: string, courseId?: string): Promise<ActionResult> {
  // Check authorization
  const auth = await checkAuthorization()
  if (!auth.authorized) {
    return {
      success: false,
      message: auth.message ?? "Authorization failed",
    }
  }

  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return {
        success: false,
        message: "Invalid class ID",
      }
    }

    // Parse date
    const attendanceDate = new Date(date)
    attendanceDate.setHours(0, 0, 0, 0)

    const nextDay = new Date(attendanceDate)
    nextDay.setDate(nextDay.getDate() + 1)

    // Build query
    const query: any = {
      class: classId,
      date: {
        $gte: attendanceDate,
        $lt: nextDay,
      },
    }

    if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
      query.course = courseId
    }

    // Get class details and serialize immediately
    let classDetailsLean = await ClassModel.findById(classId).populate("classTeacher", "firstName lastName").lean()
    if (!classDetailsLean) {
      return {
        success: false,
        message: "Class not found",
      }
    }

    const classDetails = serializeData(classDetailsLean); // Serialize here

    // Get students in this class and serialize immediately
    let studentsLean = await StudentModel.find({ currentClass: classId })
      .select("_id firstName lastName admissionNumber") // Ensure _id is selected
      .sort("firstName")
      .lean()
    const students = serializeData(studentsLean); // Serialize here

    // Get existing attendance records and serialize immediately
    let existingAttendanceLean = await AttendanceModel.find(query)
      .populate("student", "firstName lastName admissionNumber")
      .populate("course", "name courseCode")
      .populate("markedBy", "name")
      .lean()
    const existingAttendance = serializeData(existingAttendanceLean); // Serialize here

    // Map attendance records to students using ALREADY serialized data
    const attendanceMap = new Map()
    existingAttendance.forEach((record: any) => { // Use any or a specific serialized type
      // Ensure record.student exists and has an _id before proceeding
      if (record.student && record.student._id) {
        const studentId = record.student._id // ID should already be a string from serializeData
        if (!attendanceMap.has(studentId)) {
          attendanceMap.set(studentId, [])
        }
        attendanceMap.get(studentId).push(record) // Push the serialized record
      }
    })

    // Prepare attendance data using ALREADY serialized students
    const attendanceData = students.map((student: any) => { // Use any or a specific serialized type
      const studentId = student._id // ID should already be a string
      const studentAttendance = attendanceMap.get(studentId) || []

      return {
        student, // Pass the serialized student object
        attendance: studentAttendance, // Pass the serialized attendance records
        hasAttendance: studentAttendance.length > 0,
        status: studentAttendance.length > 0 ? studentAttendance[0].status : null,
      }
    })

    // Calculate statistics
    const totalStudents = students.length
    // Add explicit type for 'data' parameter in filters
    const markedStudents = attendanceData.filter((data: { hasAttendance: boolean }) => data.hasAttendance).length
    const presentStudents = attendanceData.filter((data: { status: string | null }) => data.status === "present").length
    const absentStudents = attendanceData.filter((data: { status: string | null }) => data.status === "absent").length
    const lateStudents = attendanceData.filter((data: { status: string | null }) => data.status === "late").length
    const excusedStudents = attendanceData.filter((data: { status: string | null }) => data.status === "excused").length

    return {
      success: true,
      message: "Class attendance retrieved successfully",
      // Apply serializeData to the entire final data structure
      data: serializeData({
        classDetails, // Already serialized
        date: attendanceDate, // Pass Date object, serializeData will handle
        students: attendanceData, // Pass the prepared attendance data
        stats: {
          total: totalStudents,
          marked: markedStudents,
          unmarked: totalStudents - markedStudents,
          present: presentStudents,
          absent: absentStudents,
          late: lateStudents,
          excused: excusedStudents,
          attendanceRate: totalStudents > 0 ? (presentStudents / totalStudents) * 100 : 0,
        }
      })
    }
  } catch (error) {
    console.error("Get Class Attendance Error:", error)
    return {
      success: false,
      message: "Failed to retrieve class attendance",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// --- Mark Attendance ---
export async function markAttendance(
  studentId: string,
  classId: string,
  date: string,
  status: "present" | "absent" | "late" | "excused",
  courseId?: string,
  remarks?: string,
): Promise<ActionResult> {
  // Check authorization
  const auth = await checkAuthorization()
  if (!auth.authorized) {
    return {
      success: false,
      message: auth.message ?? "Authorization failed",
    }
  }

  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(classId)) {
      return {
        success: false,
        message: "Invalid student or class ID",
      }
    }

    // Parse date
    const attendanceDate = new Date(date)
    attendanceDate.setHours(0, 0, 0, 0)

    // Check if student exists and belongs to the class
    const student = await StudentModel.findOne({
      _id: studentId,
      currentClass: classId,
    })

    if (!student) {
      return {
        success: false,
        message: "Student not found or not in this class",
      }
    }

    // Build query to find existing attendance
    const query: any = {
      student: studentId,
      class: classId,
      date: attendanceDate,
    }

    if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
      query.course = courseId
    }

    // Check if attendance already exists
    const existingAttendance = await AttendanceModel.findOne(query)

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.status = status
      if (remarks !== undefined) {
        existingAttendance.remarks = remarks
      }
      await existingAttendance.save()

      return {
        success: true,
        message: "Attendance updated successfully",
        data: serializeData(existingAttendance), // Serialize data here
      }
    } else {
      // Create new attendance record
      const newAttendance = new AttendanceModel({
        student: studentId,
        class: classId,
        course: courseId,
        date: attendanceDate,
        status,
        remarks,
        markedBy: auth.userId,
      })

      await newAttendance.save()

      return {
        success: true,
        message: "Attendance marked successfully",
        data: serializeData(newAttendance), // Serialize data here
      }
    }
  } catch (error) {
    console.error("Mark Attendance Error:", error)
    return {
      success: false,
      message: "Failed to mark attendance",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// --- Mark Bulk Attendance ---
export async function markBulkAttendance(
  classId: string,
  date: string,
  attendanceData: {
    studentId: string
    status: "present" | "absent" | "late" | "excused"
    remarks?: string
  }[],
  courseId?: string,
): Promise<ActionResult> {
  // Check authorization
  const auth = await checkAuthorization()
  if (!auth.authorized) {
    return {
      success: false,
      message: auth.message ?? "Authorization failed",
    }
  }

  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return {
        success: false,
        message: "Invalid class ID",
      }
    }

    // Parse date
    const attendanceDate = new Date(date)
    attendanceDate.setHours(0, 0, 0, 0)

    try {
      // Process each student's attendance
      const results = []

      for (const item of attendanceData) {
        if (!mongoose.Types.ObjectId.isValid(item.studentId)) {
          continue
        }

        // Build query to find existing attendance
        const query: any = {
          student: item.studentId,
          class: classId,
          date: attendanceDate,
        }

        if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
          query.course = courseId
        }

        // Check if attendance already exists
        const existingAttendance = await AttendanceModel.findOne(query)

        if (existingAttendance) {
          // Update existing attendance
          existingAttendance.status = item.status
          if (item.remarks !== undefined) {
            existingAttendance.remarks = item.remarks
          }
          await existingAttendance.save()
          results.push(existingAttendance)
        } else {
          // Create new attendance record
          const newAttendance = new AttendanceModel({
            student: item.studentId,
            class: classId,
            course: courseId,
            date: attendanceDate,
            status: item.status,
            remarks: item.remarks,
            markedBy: auth.userId,
          })

          await newAttendance.save()
          results.push(newAttendance)
        }
      }

      return {
        success: true,
        message: "Bulk attendance marked successfully",
        data: serializeData({ // Serialize data here
          count: results.length,
          date: attendanceDate,
        }) // Removed trailing comma here
      } // Closing brace for the inner try block
    } catch (error) {
      console.error("Mark Bulk Attendance Error:", error)
      // Ensure the outer catch block returns the correct structure
      return {
        success: false,
        message: "Failed to mark bulk attendance during processing",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
    // This catch block was missing its closing brace and return statement in the previous version
  } catch (error) {
    console.error("Mark Bulk Attendance Error (Outer):", error)
    return {
      success: false,
      message: "Failed to mark bulk attendance",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// --- Get Attendance Statistics ---
export async function getAttendanceStatistics(
  classId?: string,
  startDate?: string,
  endDate?: string,
): Promise<ActionResult> {
  // Check authorization
  const auth = await checkAuthorization()
  if (!auth.authorized) {
    return {
      success: false,
      message: auth.message ?? "Authorization failed",
    }
  }

  try {
    await connectToDatabase()

    // Build query
    const query: any = {}

    if (classId && mongoose.Types.ObjectId.isValid(classId)) {
      query.class = classId
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) }
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) }
    } else {
      // Default to current month if no date range provided
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      query.date = { $gte: startOfMonth }
    }

    // Get all attendance records
    const attendanceRecords = await AttendanceModel.find(query).lean()

    // Calculate overall statistics
    const totalRecords = attendanceRecords.length
    const presentCount = attendanceRecords.filter((record) => record.status === "present").length
    const absentCount = attendanceRecords.filter((record) => record.status === "absent").length
    const lateCount = attendanceRecords.filter((record) => record.status === "late").length
    const excusedCount = attendanceRecords.filter((record) => record.status === "excused").length

    // Group by date
    const dailyStats: Record<string, any> = {}

    attendanceRecords.forEach((record) => {
      const dateStr = new Date(record.date).toISOString().split("T")[0]

      if (!dailyStats[dateStr]) {
        dailyStats[dateStr] = {
          date: dateStr,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
        }
      }

      dailyStats[dateStr].total++
      dailyStats[dateStr][record.status]++
    })

    // Convert to array and sort by date
    const dailyStatsArray = Object.values(dailyStats).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    // If class is specified, get class-specific data
    let classData = null
    if (classId && mongoose.Types.ObjectId.isValid(classId)) {
      const classDetails = await ClassModel.findById(classId).populate("classTeacher", "firstName lastName").lean()

      if (classDetails) {
        // Get student count for attendance rate calculation
        const studentCount = await StudentModel.countDocuments({ currentClass: classId })

        classData = {
          details: classDetails,
          studentCount,
          attendanceRate: studentCount > 0 ? (presentCount / (studentCount * dailyStatsArray.length)) * 100 : 0,
        }
      }
    }

    return {
      success: true,
      message: "Attendance statistics retrieved successfully",
      data: serializeData({ // Serialize data here
        overall: {
          total: totalRecords,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          excused: excusedCount,
          attendanceRate: totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0,
        },
        daily: dailyStatsArray,
        class: classData,
      }) // Removed trailing comma here
    }
  } catch (error) {
    console.error("Get Attendance Statistics Error:", error)
    return {
      success: false,
      message: "Failed to retrieve attendance statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// --- Delete Attendance Record ---
export async function deleteAttendanceRecord(attendanceId: string): Promise<ActionResult> {
  // Check authorization (only admin and staff can delete)
  const auth = await checkAuthorization([UserRole.ADMIN, UserRole.STAFF])
  if (!auth.authorized) {
    return {
      success: false,
      message: auth.message ?? "Authorization failed",
    }
  }

  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
      return {
        success: false,
        message: "Invalid attendance ID",
      }
    }

    const deletedAttendance = await AttendanceModel.findByIdAndDelete(attendanceId)

    if (!deletedAttendance) {
      return {
        success: false,
        message: "Attendance record not found",
      }
    }

    return {
      success: true,
      message: "Attendance record deleted successfully",
    }
  } catch (error) {
    console.error("Delete Attendance Record Error:", error)
    return {
      success: false,
      message: "Failed to delete attendance record",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
