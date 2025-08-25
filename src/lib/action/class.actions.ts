"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import mongoose from "mongoose"
import { connectToDatabase } from "@/lib/mongoose"
import ClassModel from "@/database/models/Class.model"
import StudentModel from "@/database/models/Student.model"
import TeacherModel from "@/database/models/Teacher.model"
import CourseModel from "@/database/models/Course.model"

// Create a new class
export async function createClass(formData: FormData) {
  try {
    await connectToDatabase()

    const name = formData.get("name") as string
    const academicYear = formData.get("academicYear") as string
    const form = formData.get("form") as string
    const stream = formData.get("stream") as string
    const classTeacherId = formData.get("classTeacher") as string
    const capacity = Number(formData.get("capacity") || 0)

    // Create schedule array from form data
    const scheduleCount = Number(formData.get("scheduleCount") || 0)
    const schedule = []

    for (let i = 0; i < scheduleCount; i++) {
      const day = formData.get(`schedule[${i}].day`) as string
      const startTime = formData.get(`schedule[${i}].startTime`) as string
      const endTime = formData.get(`schedule[${i}].endTime`) as string
      const room = formData.get(`schedule[${i}].room`) as string

      if (day && startTime && endTime) {
        schedule.push({
          day,
          startTime,
          endTime,
          room: room || undefined,
        })
      }
    }

    // Create new class
    const newClass = new ClassModel({
      name,
      academicYear,
      form,
      stream,
      classTeacher: classTeacherId ? new mongoose.Types.ObjectId(classTeacherId) : undefined,
      capacity: capacity > 0 ? capacity : undefined,
      schedule,
      isActive: true,
    })

    await newClass.save()

    revalidatePath("/dashboard/classes")
    redirect("/dashboard/classes")
  } catch (error: any) {
    console.error("Error creating class:", error)
    throw new Error(`Failed to create class: ${error.message}`)
  }
}

// Get all classes with pagination and filtering
export async function getClasses({
  page = 1,
  limit = 10,
  search = "",
  academicYear = "",
  form = "",
  isActive = true,
}: {
  page?: number
  limit?: number
  search?: string
  academicYear?: string
  form?: string
  isActive?: boolean
}) {
  try {
    await connectToDatabase()

    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (search) {
      query.name = { $regex: search, $options: "i" }
    }

    if (academicYear) {
      query.academicYear = academicYear
    }

    if (form) {
      query.form = form
    }

    if (isActive !== undefined) {
      query.isActive = isActive
    }

    // Execute query with pagination
    const classes = await ClassModel.find(query)
      .populate("classTeacher", "firstName lastName email")
      .sort({ academicYear: -1, form: 1, name: 1 })
      .skip(skip)
      .limit(limit)
      .lean() // Get plain JS objects

    // Get total count for pagination
    const totalClasses = await ClassModel.countDocuments(query)

    // Explicitly convert ObjectIds to strings for serialization
    const serializableClasses = classes.map((cls) => ({
      ...cls,
      _id: cls._id.toString(),
      classTeacher: cls.classTeacher ? { ...cls.classTeacher, _id: cls.classTeacher._id.toString() } : null,
      // Assuming students and courses are not populated in getClasses, but if they were:
      // students: cls.students?.map(s => ({ ...s, _id: s._id.toString() })),
      // courses: cls.courses?.map(c => ({ ...c, _id: c._id.toString() })),
    }))

    return {
      classes: serializableClasses,
      totalPages: Math.ceil(totalClasses / limit),
      currentPage: page,
    }
  } catch (error: any) {
    console.error("Error fetching classes:", error)
    throw new Error(`Failed to fetch classes: ${error.message}`)
  }
}

// Get a single class by ID
export async function getClassById(id: string) {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid class ID")
    }

    const classData = await ClassModel.findById(id)
      .populate("classTeacher", "firstName lastName email phoneNumber")
      .populate("students", "firstName lastName admissionNumber")
      .populate("courses", "name code description")
      .lean()

    if (!classData) {
      throw new Error("Class not found")
    }

    // Explicitly convert ObjectIds to strings for serialization
    // Ensure all populated fields are preserved
    const serializableClassData = JSON.parse(JSON.stringify(classData)) // Deep clone and serialize

    // Although JSON.stringify handles most cases, let's be explicit for clarity if needed later
    // const serializableClassData = {
    //   ...classData,
    //   _id: classData._id.toString(),
    //   classTeacher: classData.classTeacher
    //     ? {
    //         ...classData.classTeacher, // Spread the lean object
    //         _id: classData.classTeacher._id.toString(), // Ensure _id is string
    //       }
    //     : null,
    //   students:
    //     classData.students?.map((s: any) => ({
    //       ...s, // Spread the lean object
    //       _id: s._id.toString(), // Ensure _id is string
    //     })) || [],
    //   courses:
    //     classData.courses?.map((c: any) => ({
    //       ...c, // Spread the lean object
    //       _id: c._id.toString(), // Ensure _id is string
    //     })) || [],
    // }

    return serializableClassData
  } catch (error: any) {
    console.error("Error fetching class:", error)
    throw new Error(`Failed to fetch class: ${error.message}`)
  }
}

// Update a class
export async function updateClass(id: string, formData: FormData) {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid class ID")
    }

    const name = formData.get("name") as string
    const academicYear = formData.get("academicYear") as string
    const form = formData.get("form") as string
    const stream = formData.get("stream") as string
    const classTeacherId = formData.get("classTeacher") as string
    const capacity = Number(formData.get("capacity") || 0)
    const isActive = formData.get("isActive") === "true"

    // Create schedule array from form data
    const scheduleCount = Number(formData.get("scheduleCount") || 0)
    const schedule = []

    for (let i = 0; i < scheduleCount; i++) {
      const day = formData.get(`schedule[${i}].day`) as string
      const startTime = formData.get(`schedule[${i}].startTime`) as string
      const endTime = formData.get(`schedule[${i}].endTime`) as string
      const room = formData.get(`schedule[${i}].room`) as string

      if (day && startTime && endTime) {
        schedule.push({
          day,
          startTime,
          endTime,
          room: room || undefined,
        })
      }
    }

    // Update class
    const updatedClass = await ClassModel.findByIdAndUpdate(
      id,
      {
        name,
        academicYear,
        form,
        stream,
        classTeacher: classTeacherId ? new mongoose.Types.ObjectId(classTeacherId) : undefined,
        capacity: capacity > 0 ? capacity : undefined,
        schedule,
        isActive,
      },
      { new: true },
    )

    if (!updatedClass) {
      throw new Error("Class not found")
    }

    revalidatePath(`/dashboard/classes/${id}`)
    revalidatePath("/dashboard/classes")
    redirect(`/dashboard/classes/${id}`) // This throws NEXT_REDIRECT
  } catch (error: any) {
    // Check if it's a redirect error and re-throw if so
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    // Handle other errors
    console.error("Error updating class:", error)
    throw new Error(`Failed to update class: ${error.message}`)
  }
}

// Delete a class
export async function deleteClass(id: string) {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid class ID")
    }

    const deletedClass = await ClassModel.findByIdAndDelete(id)

    if (!deletedClass) {
      throw new Error("Class not found")
    }

    revalidatePath("/dashboard/classes")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting class:", error)
    throw new Error(`Failed to delete class: ${error.message}`)
  }
}

// Assign students to a class
export async function assignStudentsToClass(classId: string, studentIds: string[]) {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      throw new Error("Invalid class ID")
    }

    // Validate student IDs
    const validStudentIds = studentIds.filter((id) => mongoose.Types.ObjectId.isValid(id))

    // Update class with student IDs
    const updatedClass = await ClassModel.findByIdAndUpdate(
      classId,
      { $set: { students: validStudentIds.map((id) => new mongoose.Types.ObjectId(id)) } },
      { new: true },
    )

    if (!updatedClass) {
      throw new Error("Class not found")
    }

    revalidatePath(`/dashboard/classes/${classId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Error assigning students:", error)
    throw new Error(`Failed to assign students: ${error.message}`)
  }
}

// Assign courses to a class
export async function assignCoursesToClass(classId: string, courseIds: string[]) {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      throw new Error("Invalid class ID")
    }

    // Validate course IDs
    const validCourseIds = courseIds.filter((id) => mongoose.Types.ObjectId.isValid(id))

    // Update class with course IDs
    const updatedClass = await ClassModel.findByIdAndUpdate(
      classId,
      { $set: { courses: validCourseIds.map((id) => new mongoose.Types.ObjectId(id)) } },
      { new: true },
    )

    if (!updatedClass) {
      throw new Error("Class not found")
    }

    revalidatePath(`/dashboard/classes/${classId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Error assigning courses:", error)
    throw new Error(`Failed to assign courses: ${error.message}`)
  }
}

// Get available teachers (not assigned as class teachers)
export async function getAvailableTeachers() {
  try {
    await connectToDatabase()

    // Find all teachers
    const allTeachers = await TeacherModel.find({ isActive: true }).select("_id firstName lastName email").lean()

    // Find teachers who are already class teachers
    const assignedTeachers = await ClassModel.find({ isActive: true }).select("classTeacher").lean()

    const assignedTeacherIds = assignedTeachers.filter((c) => c.classTeacher).map((c) => c.classTeacher?.toString())

    // Filter out teachers who are already assigned
    const availableTeachers = allTeachers.filter((teacher) => !assignedTeacherIds.includes(teacher._id.toString()))

    return availableTeachers
  } catch (error: any) {
    console.error("Error fetching available teachers:", error)
    throw new Error(`Failed to fetch available teachers: ${error.message}`)
  }
}

// Get all active teachers for selection
export async function getAllActiveTeachers() {
  try {
    await connectToDatabase()

    const teachers = await TeacherModel.find({ isActive: true })
      .select("_id firstName lastName email subjects")
      .sort({ lastName: 1, firstName: 1 })
      .lean()

    return teachers
  } catch (error: any) {
    console.error("Error fetching teachers:", error)
    throw new Error(`Failed to fetch teachers: ${error.message}`)
  }
}

// Get students not assigned to any class
export async function getUnassignedStudents() {
  try {
    await connectToDatabase()

    // Find all active students
    const allStudents = await StudentModel.find({ isActive: true })
      .select("_id firstName lastName admissionNumber")
      .lean()

    // Find all students assigned to classes
    const classes = await ClassModel.find({ isActive: true }).select("students").lean()

    // Flatten the array of student arrays
    const assignedStudentIds = new Set()
    classes.forEach((cls) => {
      if (cls.students && cls.students.length) {
        cls.students.forEach((studentId) => {
          assignedStudentIds.add(studentId.toString())
        })
      }
    })

    // Filter out students who are already assigned
    const unassignedStudents = allStudents.filter((student) => !assignedStudentIds.has(student._id.toString()))

    return unassignedStudents
  } catch (error: any) {
    console.error("Error fetching unassigned students:", error)
    throw new Error(`Failed to fetch unassigned students: ${error.message}`)
  }
}

// Get all active courses for selection
export async function getAllActiveCourses() {
  try {
    await connectToDatabase()

    const courses = await CourseModel.find({ isActive: true })
      .select("_id name code description")
      .sort({ name: 1 })
      .lean()

    return courses
  } catch (error: any) {
    console.error("Error fetching courses:", error)
    throw new Error(`Failed to fetch courses: ${error.message}`)
  }
}

// Get students in a specific class
export async function getStudentsInClass(classId: string) {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      throw new Error("Invalid class ID")
    }

    const classData = await ClassModel.findById(classId).select("students").lean()

    if (!classData) {
      throw new Error("Class not found")
    }

    if (!classData.students || classData.students.length === 0) {
      return []
    }

    const students = await StudentModel.find({
      _id: { $in: classData.students },
    })
      .select("_id firstName lastName admissionNumber gender dateOfBirth")
      .sort({ lastName: 1, firstName: 1 })
      .lean()

    return students
  } catch (error: any) {
    console.error("Error fetching students in class:", error)
    throw new Error(`Failed to fetch students in class: ${error.message}`)
  }
}
