// src/lib/action/course.actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../mongoose";
import CourseModel from "@/database/models/Course.model";
import { getServerSession } from "../auth";
import { UserRole } from "@/types";
import mongoose from "mongoose";

// --- Validation Schemas ---
const CourseSchema = z.object({
  courseCode: z.string().min(2, { message: "Course code is required" }),
  name: z.string().min(2, { message: "Course name is required" }),
  description: z.string().optional(),
  credits: z.coerce
    .number()
    .min(0, { message: "Credits must be a positive number" }),
  duration: z.string().optional(),
  level: z.string().optional(),
  department: z.string().optional(),
  isActive: z.boolean().default(true),
  syllabus: z.string().optional(),
  prerequisites: z.array(z.string()).default([]),
  teachers: z.array(z.string()).default([]),
});

// --- Types for Action Results ---
interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string | null;
  fieldErrors?: Record<string, string[]>;
}

// --- Check Authorization ---
async function checkAuthorization(
  allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.STAFF]
) {
  const session = await getServerSession();

  if (!session?.user) {
    return { authorized: false, message: "Not authenticated" };
  }

  if (!allowedRoles.includes(session.user.role as UserRole)) {
    return {
      authorized: false,
      message: "Not authorized to perform this action",
    };
  }

  return { authorized: true, userId: session.user.id };
}

// --- Create Course ---
export async function createCourse(formData: unknown): Promise<ActionResult> {
  // Check authorization
  const auth = await checkAuthorization();
  if (!auth.authorized) {
    return {
      success: false,
      message: auth.message ?? "Authorization failed",
    };
  }

  // Validate input
  const validationResult = CourseSchema.safeParse(formData);
  if (!validationResult.success) {
    return {
      success: false,
      message: "Invalid input data",
      fieldErrors: validationResult.error.flatten().fieldErrors,
    };
  }

  const {
    courseCode,
    name,
    description,
    credits,
    duration,
    level,
    department,
    isActive,
    syllabus,
    prerequisites,
    teachers,
  } = validationResult.data;

  try {
    await connectToDatabase();

    // Check if course with course code already exists
    const existingCourse = await CourseModel.findOne({ courseCode });
    if (existingCourse) {
      return {
        success: false,
        message: "Course with this course code already exists",
      };
    }

    // Create course record
    const newCourse = await CourseModel.create({
      courseCode,
      name,
      description,
      credits,
      duration,
      level,
      department,
      isActive,
      syllabus,
      prerequisites,
      teachers: teachers.map((id) => new mongoose.Types.ObjectId(id)),
    });

    revalidatePath("/dashboard/courses");

    return {
      success: true,
      message: "Course created successfully",
      data: newCourse,
    };
  } catch (error) {
    console.error("Create Course Error:", error);
    return {
      success: false,
      message: "Failed to create course",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// --- Get All Courses ---
export async function getAllCourses(
  page = 1,
  limit = 10,
  search = "",
  department = "",
  isActive?: boolean
): Promise<ActionResult> {
  // Check authorization
  const auth = await checkAuthorization([
    UserRole.ADMIN,
    UserRole.STAFF,
    UserRole.TEACHER,
  ]);
  if (!auth.authorized) {
    return {
      success: false,
      message: auth.message ?? "Authorization failed",
    };
  }

  try {
    await connectToDatabase();

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { courseCode: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    if (department) {
      query.department = department;
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const courses = await CourseModel.find(query)
      .populate("teachers", "firstName lastName staffId")
      .sort({ courseCode: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalCourses = await CourseModel.countDocuments(query);

    // Get all departments for filtering
    const departments = await CourseModel.distinct("department");

    return {
      success: true,
      message: "Courses retrieved successfully",
      data: {
        courses,
        departments: departments.filter(Boolean), // Remove null/empty departments
        pagination: {
          total: totalCourses,
          page,
          limit,
          pages: Math.ceil(totalCourses / limit),
        },
      },
    };
  } catch (error) {
    console.error("Get Courses Error:", error);
    return {
      success: false,
      message: "Failed to retrieve courses",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// --- Get Course By ID ---
export async function getCourseById(id: string): Promise<ActionResult> {
  // Check authorization
  const auth = await checkAuthorization([
    UserRole.ADMIN,
    UserRole.STAFF,
    UserRole.TEACHER,
  ]);
  if (!auth.authorized) {
    return {
      success: false,
      message: auth.message ?? "Authorization failed",
    };
  }

  try {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        success: false,
        message: "Invalid course ID",
      };
    }

    const course = await CourseModel.findById(id)
      .populate("teachers", "firstName lastName staffId")
      .lean();

    if (!course) {
      return {
        success: false,
        message: "Course not found",
      };
    }

    return {
      success: true,
      message: "Course retrieved successfully",
      data: course,
    };
  } catch (error) {
    console.error("Get Course Error:", error);
    return {
      success: false,
      message: "Failed to retrieve course",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// --- Update Course ---
export async function updateCourse(
  id: string,
  formData: unknown
): Promise<ActionResult> {
  // Check authorization
  const auth = await checkAuthorization();
  if (!auth.authorized) {
    return {
      success: false,
      message: auth.message ?? "Authorization failed",
    };
  }

  // Validate input
  const validationResult = CourseSchema.partial().safeParse(formData);
  if (!validationResult.success) {
    return {
      success: false,
      message: "Invalid input data",
      fieldErrors: validationResult.error.flatten().fieldErrors,
    };
  }

  try {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        success: false,
        message: "Invalid course ID",
      };
    }

    const course = await CourseModel.findById(id);
    if (!course) {
      return {
        success: false,
        message: "Course not found",
      };
    }

    // Check if course code is being changed and if it's already in use
    if (
      validationResult.data.courseCode &&
      validationResult.data.courseCode !== course.courseCode
    ) {
      const existingCourse = await CourseModel.findOne({
        courseCode: validationResult.data.courseCode,
        _id: { $ne: id },
      });

      if (existingCourse) {
        return {
          success: false,
          message: "Course with this course code already exists",
        };
      }
    }

    // Convert teacher IDs to ObjectIds if present
    const updateData = { ...validationResult.data };
    if (updateData.teachers) {
      updateData.teachers = updateData.teachers.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }

    // Update course
    const updatedCourse = await CourseModel.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("teachers", "firstName lastName staffId");

    revalidatePath(`/dashboard/courses/${id}`);
    revalidatePath("/dashboard/courses");

    return {
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    };
  } catch (error) {
    console.error("Update Course Error:", error);
    return {
      success: false,
      message: "Failed to update course",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// --- Delete Course ---
export async function deleteCourse(id: string): Promise<ActionResult> {
  // Check authorization
  const auth = await checkAuthorization([UserRole.ADMIN]); // Only admin can delete
  if (!auth.authorized) {
    return {
      success: false,
      message: auth.message ?? "Authorization failed",
    };
  }

  try {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        success: false,
        message: "Invalid course ID",
      };
    }

    const course = await CourseModel.findById(id);
    if (!course) {
      return {
        success: false,
        message: "Course not found",
      };
    }

    // Delete course
    await CourseModel.findByIdAndDelete(id);

    revalidatePath("/dashboard/courses");

    return {
      success: true,
      message: "Course deleted successfully",
    };
  } catch (error) {
    console.error("Delete Course Error:", error);
    return {
      success: false,
      message: "Failed to delete course",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
