"use server"

import { connectToDatabase } from "../mongoose"
import GradeModel from "@/database/models/Grade.model"
import StudentModel from "@/database/models/Student.model"
import CourseModel from "@/database/models/Course.model"
import ClassModel from "@/database/models/Class.model"
import { getServerSession } from "../auth"
import { UserRole } from "@/types"
import mongoose from "mongoose"
import { revalidatePath } from "next/cache"

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

  if (!session?.user) {
    return { authorized: false, message: "Not authenticated" }
  }

  if (!allowedRoles.includes(session.user.role as UserRole)) {
    return {
      authorized: false,
      message: "Not authorized to perform this action",
    }
  }

  return { authorized: true, userId: session.user.id }
}

// --- Create or Update Grade ---
export async function createOrUpdateGrade(formData: FormData): Promise<ActionResult> {
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

    const gradeId = formData.get("gradeId") as string
    const studentId = formData.get("studentId") as string
    const courseId = formData.get("courseId") as string
    const classId = formData.get("classId") as string
    const academicYear = formData.get("academicYear") as string
    const term = formData.get("term") as string
    const examType = formData.get("examType") as string
    const score = Number(formData.get("score"))
    const maxScore = Number(formData.get("maxScore"))
    const remarks = formData.get("remarks") as string

    // Validate required fields
    if (!studentId || !courseId || !classId || !academicYear || !term || !examType || isNaN(score) || isNaN(maxScore)) {
      return {
        success: false,
        message: "Missing required fields",
      }
    }

    // Calculate percentage
    const percentage = (score / maxScore) * 100

    // Determine grade letter based on percentage
    let gradeLetter = ""
    if (percentage >= 90) gradeLetter = "A+"
    else if (percentage >= 80) gradeLetter = "A"
    else if (percentage >= 75) gradeLetter = "B+"
    else if (percentage >= 70) gradeLetter = "B"
    else if (percentage >= 65) gradeLetter = "C+"
    else if (percentage >= 60) gradeLetter = "C"
    else if (percentage >= 55) gradeLetter = "D+"
    else if (percentage >= 50) gradeLetter = "D"
    else gradeLetter = "F"

    const gradeData = {
      student: new mongoose.Types.ObjectId(studentId),
      course: new mongoose.Types.ObjectId(courseId),
      class: new mongoose.Types.ObjectId(classId),
      academicYear,
      term,
      examType,
      score,
      maxScore,
      percentage,
      grade: gradeLetter,
      remarks,
      gradedBy: new mongoose.Types.ObjectId(auth.userId),
      gradedDate: new Date(),
    }

    let grade

    if (gradeId && mongoose.Types.ObjectId.isValid(gradeId)) {
      // Update existing grade
      grade = await GradeModel.findByIdAndUpdate(gradeId, gradeData, { new: true })

      if (!grade) {
        return {
          success: false,
          message: "Grade not found",
        }
      }
    } else {
      // Check if a grade already exists for this student, course, term, and exam type
      const existingGrade = await GradeModel.findOne({
        student: gradeData.student,
        course: gradeData.course,
        term: gradeData.term,
        examType: gradeData.examType,
      })

      if (existingGrade) {
        // Update existing grade
        grade = await GradeModel.findByIdAndUpdate(existingGrade._id, gradeData, { new: true })
      } else {
        // Create new grade
        grade = await GradeModel.create(gradeData)
      }
    }

    revalidatePath(`/dashboard/grades`)
    revalidatePath(`/dashboard/grades/class/${classId}`)
    revalidatePath(`/dashboard/grades/student/${studentId}`)
    revalidatePath(`/dashboard/students/${studentId}`)

    return {
      success: true,
      message: "Grade saved successfully",
      data: grade,
    }
  } catch (error) {
    console.error("Create/Update Grade Error:", error)
    return {
      success: false,
      message: "Failed to save grade",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// --- Get Student Grades ---
export async function getStudentGrades(studentId: string): Promise<ActionResult> {
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

    // Fetch grades for the student, sorted by term and course
    const grades = await GradeModel.find({ student: studentId })
      .populate("course", "name courseCode")
      .populate("class", "name")
      .sort({ academicYear: -1, term: -1 })
      .lean()

    // Group grades by academic year and term
    const groupedGrades: Record<string, Record<string, any[]>> = {}

    grades.forEach((grade) => {
      if (!groupedGrades[grade.academicYear]) {
        groupedGrades[grade.academicYear] = {}
      }

      if (!groupedGrades[grade.academicYear][grade.term]) {
        groupedGrades[grade.academicYear][grade.term] = []
      }

      groupedGrades[grade.academicYear][grade.term].push(grade)
    })

    return {
      success: true,
      message: "Student grades retrieved successfully",
      data: {
        grades,
        groupedGrades,
      },
    }
  } catch (error) {
    console.error("Get Student Grades Error:", error)
    return {
      success: false,
      message: "Failed to retrieve student grades",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// --- Get Class Grades ---
export async function getClassGrades(classId: string, courseId?: string, term?: string): Promise<ActionResult> {
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

    // Build query
    const query: any = { class: new mongoose.Types.ObjectId(classId) }

    if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
      query.course = new mongoose.Types.ObjectId(courseId)
    }

    if (term) {
      query.term = term
    }

    // Fetch class details
    const classDetails = await ClassModel.findById(classId).lean()
    if (!classDetails) {
      return {
        success: false,
        message: "Class not found",
      }
    }

    // Fetch students in the class
    const students = await StudentModel.find({ classId: new mongoose.Types.ObjectId(classId) })
      .select("_id firstName lastName registrationNumber")
      .sort({ lastName: 1, firstName: 1 })
      .lean()

    // Fetch courses for the class
    const courses = await CourseModel.find({}).select("_id name courseCode").sort({ name: 1 }).lean()

    // Fetch grades for the class
    const grades = await GradeModel.find(query)
      .populate("student", "firstName lastName registrationNumber")
      .populate("course", "name courseCode")
      .sort({ "student.lastName": 1, "student.firstName": 1 })
      .lean()

    // Group grades by student and course
    const gradesByStudent: Record<string, any> = {}

    students.forEach((student) => {
      gradesByStudent[student._id.toString()] = {
        student,
        courses: {},
      }
    })

    grades.forEach((grade) => {
      const studentId = grade.student._id.toString()
      const courseId = grade.course._id.toString()

      if (!gradesByStudent[studentId]) {
        return // Skip if student not found (might have been transferred)
      }

      if (!gradesByStudent[studentId].courses[courseId]) {
        gradesByStudent[studentId].courses[courseId] = {
          course: grade.course,
          grades: [],
        }
      }

      gradesByStudent[studentId].courses[courseId].grades.push(grade)
    })

    // Get available terms from grades
    const terms = [...new Set(grades.map((grade) => grade.term))].sort()

    return {
      success: true,
      message: "Class grades retrieved successfully",
      data: {
        classDetails,
        students,
        courses,
        gradesByStudent,
        terms,
      },
    }
  } catch (error) {
    console.error("Get Class Grades Error:", error)
    return {
      success: false,
      message: "Failed to retrieve class grades",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// --- Get Course Grades ---
export async function getCourseGrades(courseId: string, classId?: string, term?: string): Promise<ActionResult> {
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

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return {
        success: false,
        message: "Invalid course ID",
      }
    }

    // Build query
    const query: any = { course: new mongoose.Types.ObjectId(courseId) }

    if (classId && mongoose.Types.ObjectId.isValid(classId)) {
      query.class = new mongoose.Types.ObjectId(classId)
    }

    if (term) {
      query.term = term
    }

    // Fetch course details
    const courseDetails = await CourseModel.findById(courseId).lean()
    if (!courseDetails) {
      return {
        success: false,
        message: "Course not found",
      }
    }

    // Fetch classes
    const classes = await ClassModel.find({}).select("_id name academicYear").sort({ academicYear: -1, name: 1 }).lean()

    // Fetch grades for the course
    const grades = await GradeModel.find(query)
      .populate("student", "firstName lastName registrationNumber")
      .populate("class", "name academicYear")
      .sort({ academicYear: -1, term: -1, "student.lastName": 1, "student.firstName": 1 })
      .lean()

    // Group grades by class, term, and student
    const gradesByClass: Record<string, any> = {}

    grades.forEach((grade) => {
      const classId = grade.class._id.toString()
      const term = grade.term
      const studentId = grade.student._id.toString()

      if (!gradesByClass[classId]) {
        gradesByClass[classId] = {
          class: grade.class,
          terms: {},
        }
      }

      if (!gradesByClass[classId].terms[term]) {
        gradesByClass[classId].terms[term] = {
          students: {},
        }
      }

      if (!gradesByClass[classId].terms[term].students[studentId]) {
        gradesByClass[classId].terms[term].students[studentId] = {
          student: grade.student,
          grades: [],
        }
      }

      gradesByClass[classId].terms[term].students[studentId].grades.push(grade)
    })

    // Get available terms from grades
    const terms = [...new Set(grades.map((grade) => grade.term))].sort()

    return {
      success: true,
      message: "Course grades retrieved successfully",
      data: {
        courseDetails,
        classes,
        gradesByClass,
        terms,
      },
    }
  } catch (error) {
    console.error("Get Course Grades Error:", error)
    return {
      success: false,
      message: "Failed to retrieve course grades",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// --- Delete Grade ---
export async function deleteGrade(gradeId: string): Promise<ActionResult> {
  // Check authorization
  const auth = await checkAuthorization([UserRole.ADMIN, UserRole.STAFF]) // Only admin and staff can delete grades
  if (!auth.authorized) {
    return {
      success: false,
      message: auth.message ?? "Authorization failed",
    }
  }

  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(gradeId)) {
      return {
        success: false,
        message: "Invalid grade ID",
      }
    }

    // Get grade details before deletion for revalidation paths
    const grade = await GradeModel.findById(gradeId).lean()
    if (!grade) {
      return {
        success: false,
        message: "Grade not found",
      }
    }

    // Delete the grade
    await GradeModel.findByIdAndDelete(gradeId)

    // Revalidate paths
    revalidatePath(`/dashboard/grades`)
    revalidatePath(`/dashboard/grades/class/${grade.class}`)
    revalidatePath(`/dashboard/grades/student/${grade.student}`)
    revalidatePath(`/dashboard/students/${grade.student}`)

    return {
      success: true,
      message: "Grade deleted successfully",
    }
  } catch (error) {
    console.error("Delete Grade Error:", error)
    return {
      success: false,
      message: "Failed to delete grade",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// --- Get Student Academic Summary ---
export async function getStudentAcademicSummary(studentId: string): Promise<ActionResult> {
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

    // Get the latest academic year and term
    const latestGrade = await GradeModel.findOne({ student: studentId }).sort({ academicYear: -1, term: -1 }).lean()

    if (!latestGrade) {
      return {
        success: true,
        message: "No academic records found for student",
        data: {
          currentAcademicYear: null,
          currentTerm: null,
          averageScore: 0,
          totalCourses: 0,
          performanceTrend: "stable",
        },
      }
    }

    const { academicYear, term } = latestGrade

    // Calculate average score for the current term
    const currentTermGrades = await GradeModel.find({
      student: studentId,
      academicYear,
      term,
    }).lean()

    let totalScore = 0
    currentTermGrades.forEach((grade) => {
      totalScore += (grade.score / grade.maxScore) * 100
    })

    const averageScore = currentTermGrades.length > 0 ? totalScore / currentTermGrades.length : 0

    // Get total number of courses
    const totalCourses = await GradeModel.distinct("course", {
      student: studentId,
      academicYear,
      term,
    }).length

    // Determine performance trend by comparing with previous term
    let performanceTrend = "stable"

    // Find the previous term
    let previousTerm: string | null = null
    let previousAcademicYear = academicYear

    if (term === "Term 3") {
      previousTerm = "Term 2"
    } else if (term === "Term 2") {
      previousTerm = "Term 1"
    } else if (term === "Term 1") {
      // Previous term would be Term 3 of the previous academic year
      // This assumes academic years are formatted like "2022-2023"
      const yearParts = academicYear.split("-")
      if (yearParts.length === 2) {
        const prevYear1 = Number.parseInt(yearParts[0]) - 1
        const prevYear2 = Number.parseInt(yearParts[1]) - 1
        previousAcademicYear = `${prevYear1}-${prevYear2}`
        previousTerm = "Term 3"
      }
    }

    if (previousTerm) {
      const previousTermGrades = await GradeModel.find({
        student: studentId,
        academicYear: previousAcademicYear,
        term: previousTerm,
      }).lean()

      if (previousTermGrades.length > 0) {
        let prevTotalScore = 0
        previousTermGrades.forEach((grade) => {
          prevTotalScore += (grade.score / grade.maxScore) * 100
        })
        const prevAverageScore = prevTotalScore / previousTermGrades.length

        // Determine trend based on 5% threshold
        if (averageScore > prevAverageScore * 1.05) {
          performanceTrend = "improving"
        } else if (averageScore < prevAverageScore * 0.95) {
          performanceTrend = "declining"
        }
      }
    }

    return {
      success: true,
      message: "Student academic summary retrieved successfully",
      data: {
        currentAcademicYear: academicYear,
        currentTerm: term,
        averageScore: Math.round(averageScore * 10) / 10, // Round to 1 decimal place
        totalCourses,
        performanceTrend,
      },
    }
  } catch (error) {
    console.error("Get Student Academic Summary Error:", error)
    return {
      success: false,
      message: "Failed to retrieve student academic summary",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// --- Get Form Data for Grade Entry ---
export async function getGradeFormData(): Promise<ActionResult> {
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

    // Get classes
    const classes = await ClassModel.find({}).select("_id name academicYear").sort({ academicYear: -1, name: 1 }).lean()

    // Get courses
    const courses = await CourseModel.find({}).select("_id name courseCode").sort({ name: 1 }).lean()

    // Define exam types
    const examTypes = [
      "Mid-Term Exam",
      "End-Term Exam",
      "Quiz",
      "Assignment",
      "Project",
      "Practical",
      "Oral Exam",
      "Final Exam",
    ]

    // Define terms
    const terms = ["Term 1", "Term 2", "Term 3"]

    // Get current academic year (this is a simplified approach)
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    let academicYear = ""

    // If we're in the second half of the year, academic year is current-next
    // Otherwise it's previous-current
    if (currentDate.getMonth() >= 6) {
      // July onwards
      academicYear = `${currentYear}-${currentYear + 1}`
    } else {
      academicYear = `${currentYear - 1}-${currentYear}`
    }

    return {
      success: true,
      message: "Grade form data retrieved successfully",
      data: {
        classes,
        courses,
        examTypes,
        terms,
        currentAcademicYear: academicYear,
      },
    }
  } catch (error) {
    console.error("Get Grade Form Data Error:", error)
    return {
      success: false,
      message: "Failed to retrieve grade form data",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// --- Get Students By Class ---
export async function getStudentsByClass(classId: string): Promise<ActionResult> {
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

    // Get students in the class
    const students = await StudentModel.find({ classId: new mongoose.Types.ObjectId(classId) })
      .select("_id firstName lastName registrationNumber")
      .sort({ lastName: 1, firstName: 1 })
      .lean()

    return {
      success: true,
      message: "Students retrieved successfully",
      data: students,
    }
  } catch (error) {
    console.error("Get Students By Class Error:", error)
    return {
      success: false,
      message: "Failed to retrieve students",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// --- Generate Grade Report ---
export async function generateGradeReport(classId: string, term: string, academicYear: string): Promise<ActionResult> {
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

    // Get class details
    const classDetails = await ClassModel.findById(classId).lean()
    if (!classDetails) {
      return {
        success: false,
        message: "Class not found",
      }
    }

    // Get students in the class
    const students = await StudentModel.find({ classId: new mongoose.Types.ObjectId(classId) })
      .select("_id firstName lastName registrationNumber")
      .sort({ lastName: 1, firstName: 1 })
      .lean()

    // Get courses for the class (simplified - in a real system, you'd have class-course assignments)
    const courses = await CourseModel.find({}).select("_id name courseCode").sort({ name: 1 }).lean()

    // Get grades for the class, term, and academic year
    const grades = await GradeModel.find({
      class: new mongoose.Types.ObjectId(classId),
      term,
      academicYear,
      examType: "Final Exam", // Only consider final exams for the report
    })
      .populate("student", "firstName lastName registrationNumber")
      .populate("course", "name courseCode")
      .lean()

    // Prepare report data
    const reportData: any = {
      classDetails,
      term,
      academicYear,
      students: [],
      courses,
      generatedAt: new Date(),
    }

    // Process student grades
    students.forEach((student) => {
      const studentGrades: any = {
        student,
        courses: {},
        totalScore: 0,
        averagePercentage: 0,
        overallGrade: "",
        rank: 0,
      }

      // Initialize course grades
      courses.forEach((course) => {
        studentGrades.courses[course._id.toString()] = {
          course,
          score: 0,
          maxScore: 0,
          percentage: 0,
          grade: "N/A",
        }
      })

      // Fill in grades where available
      grades.forEach((grade) => {
        if (grade.student._id.toString() === student._id.toString()) {
          const courseId = grade.course._id.toString()
          studentGrades.courses[courseId] = {
            course: grade.course,
            score: grade.score,
            maxScore: grade.maxScore,
            percentage: grade.percentage,
            grade: grade.grade,
          }
        }
      })

      // Calculate total and average
      let totalPercentage = 0
      let courseCount = 0

      Object.values(studentGrades.courses).forEach((courseGrade: any) => {
        if (courseGrade.maxScore > 0) {
          totalPercentage += courseGrade.percentage
          courseCount++
        }
      })

      studentGrades.averagePercentage = courseCount > 0 ? totalPercentage / courseCount : 0

      // Determine overall grade
      if (studentGrades.averagePercentage >= 90) studentGrades.overallGrade = "A+"
      else if (studentGrades.averagePercentage >= 80) studentGrades.overallGrade = "A"
      else if (studentGrades.averagePercentage >= 75) studentGrades.overallGrade = "B+"
      else if (studentGrades.averagePercentage >= 70) studentGrades.overallGrade = "B"
      else if (studentGrades.averagePercentage >= 65) studentGrades.overallGrade = "C+"
      else if (studentGrades.averagePercentage >= 60) studentGrades.overallGrade = "C"
      else if (studentGrades.averagePercentage >= 55) studentGrades.overallGrade = "D+"
      else if (studentGrades.averagePercentage >= 50) studentGrades.overallGrade = "D"
      else studentGrades.overallGrade = "F"

      reportData.students.push(studentGrades)
    })

    // Calculate ranks
    reportData.students.sort((a: any, b: any) => b.averagePercentage - a.averagePercentage)
    reportData.students.forEach((student: any, index: number) => {
      student.rank = index + 1
    })

    // Calculate class statistics
    const classStats = {
      highestAverage: reportData.students.length > 0 ? reportData.students[0].averagePercentage : 0,
      lowestAverage:
        reportData.students.length > 0 ? reportData.students[reportData.students.length - 1].averagePercentage : 0,
      classAverage: 0,
      passRate: 0,
    }

    if (reportData.students.length > 0) {
      const totalClassAverage = reportData.students.reduce(
        (sum: number, student: any) => sum + student.averagePercentage,
        0,
      )
      classStats.classAverage = totalClassAverage / reportData.students.length

      const passingStudents = reportData.students.filter((student: any) => student.averagePercentage >= 50).length
      classStats.passRate = (passingStudents / reportData.students.length) * 100
    }

    reportData.classStats = classStats

    return {
      success: true,
      message: "Grade report generated successfully",
      data: reportData,
    }
  } catch (error) {
    console.error("Generate Grade Report Error:", error)
    return {
      success: false,
      message: "Failed to generate grade report",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
