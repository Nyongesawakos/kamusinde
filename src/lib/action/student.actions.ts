// src/lib/actions/student.actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../mongoose";
import StudentModel from "@/database/models/Student.model";
import UserModel from "@/database/models/User.model";
import { getServerSession } from "../auth";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { UserRole } from "@/types";

// --- Validation Schemas ---
const StudentSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  admissionNumber: z
    .string()
    .min(2, { message: "Admission number is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  address: z.string().optional(),
  parentContact: z.string().optional(),
  form: z.string().min(1, { message: "Form/Class is required" }),
  stream: z.string().optional(),
  hostel: z.string().optional(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .optional(),
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

  // Use type assertion as a temporary fix for session type issue
  if (!allowedRoles.includes((session.user as any).role as UserRole)) {
    return {
      authorized: false,
      message: "Not authorized to perform this action",
    };
  }

  // Use type assertion as a temporary fix for session type issue
  return { authorized: true, userId: (session.user as any).id };
}

// --- Create Student ---
export async function createStudent(formData: unknown): Promise<ActionResult> {
  // Check authorization
  const auth = await checkAuthorization();
  if (!auth.authorized) {
    return {
      success: false,
      message: auth.message ?? "Authorization failed",
    };
  }

  // Validate input
  const validationResult = StudentSchema.safeParse(formData);
  if (!validationResult.success) {
    return {
      success: false,
      message: "Invalid input data",
      fieldErrors: validationResult.error.flatten().fieldErrors,
    };
  }

  const {
    firstName,
    lastName,
    admissionNumber,
    email,
    dateOfBirth,
    gender,
    address,
    parentContact,
    form,
    stream,
    hostel,
    password,
  } = validationResult.data;

  try {
    await connectToDatabase();

    // Check if student with admission number already exists
    const existingStudent = await StudentModel.findOne({ admissionNumber });
    if (existingStudent) {
      return {
        success: false,
        message: "Student with this admission number already exists",
      };
    }

    // Check if user with email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return {
        success: false,
        message: "User with this email already exists",
      };
    }

    // Create user account first
    const hashedPassword = await bcrypt.hash(password || "password123", 10);
    const newUser = await UserModel.create({
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      role: UserRole.STUDENT,
    });

    // Create student record
    const newStudent = await StudentModel.create({
      userId: newUser._id,
      firstName,
      lastName,
      admissionNumber,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      address,
      parentContact,
      form,
      stream,
      hostel,
      enrollmentDate: new Date(),
    });

    revalidatePath("/dashboard/students");

    return {
      success: true,
      message: "Student created successfully",
      data: newStudent,
    };
  } catch (error) {
    console.error("Create Student Error:", error);
    return {
      success: false,
      message: "Failed to create student",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// --- Get All Students ---
export async function getAllStudents(
  page = 1,
  limit = 10,
  search = "",
  form = "",
  stream = ""
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
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { admissionNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (form) {
      query.form = form;
    }

    if (stream) {
      query.stream = stream;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const students = await StudentModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalStudents = await StudentModel.countDocuments(query);

    return {
      success: true,
      message: "Students retrieved successfully",
      data: {
        students,
        pagination: {
          total: totalStudents,
          page,
          limit,
          pages: Math.ceil(totalStudents / limit),
        },
      },
    };
  } catch (error) {
    console.error("Get Students Error:", error);
    return {
      success: false,
      message: "Failed to retrieve students",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// --- Get Student By ID ---
export async function getStudentById(id: string): Promise<ActionResult> {
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
        message: "Invalid student ID",
      };
    }

    const student = await StudentModel.findById(id).lean();

    if (!student) {
      return {
        success: false,
        message: "Student not found",
      };
    }

    // Get user data
    const user = await UserModel.findById(student.userId)
      .select("-password")
      .lean();

    // Explicitly serialize the combined data to ensure plain objects
    const plainData = JSON.parse(JSON.stringify({ ...student, user }));

    return {
      success: true,
      message: "Student retrieved successfully",
      data: plainData,
    };
  } catch (error) {
    console.error("Get Student Error:", error);
    return {
      success: false,
      message: "Failed to retrieve student",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// --- Update Student ---
export async function updateStudent(
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
  const UpdateStudentSchema = StudentSchema.partial().omit({
    password: true,
    email: true,
  });
  const validationResult = UpdateStudentSchema.safeParse(formData);

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
        message: "Invalid student ID",
      };
    }

    const student = await StudentModel.findById(id);

    if (!student) {
      return {
        success: false,
        message: "Student not found",
      };
    }

    // Check if admission number is being changed and if it's already in use
    if (
      validationResult.data.admissionNumber &&
      validationResult.data.admissionNumber !== student.admissionNumber
    ) {
      const existingStudent = await StudentModel.findOne({
        admissionNumber: validationResult.data.admissionNumber,
        _id: { $ne: id },
      });

      if (existingStudent) {
        return {
          success: false,
          message: "Student with this admission number already exists",
        };
      }
    }

    // Update student
    const updatedStudent = await StudentModel.findByIdAndUpdate(
      id,
      {
        ...validationResult.data,
        dateOfBirth: validationResult.data.dateOfBirth
          ? new Date(validationResult.data.dateOfBirth)
          : student.dateOfBirth,
      },
      { new: true }
    );

    // Update user name if first or last name changed
    if (validationResult.data.firstName || validationResult.data.lastName) {
      const firstName = validationResult.data.firstName || student.firstName;
      const lastName = validationResult.data.lastName || student.lastName;

      await UserModel.findByIdAndUpdate(student.userId, {
        name: `${firstName} ${lastName}`,
      });
    }

    revalidatePath(`/dashboard/students/${id}`);
    revalidatePath("/dashboard/students");

    return {
      success: true,
      message: "Student updated successfully",
      data: updatedStudent,
    };
  } catch (error) {
    console.error("Update Student Error:", error);
    return {
      success: false,
      message: "Failed to update student",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// --- Delete Student ---
export async function deleteStudent(id: string): Promise<ActionResult> {
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
        message: "Invalid student ID",
      };
    }

    const student = await StudentModel.findById(id);

    if (!student) {
      return {
        success: false,
        message: "Student not found",
      };
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete student
      await StudentModel.findByIdAndDelete(id).session(session);

      // Delete associated user
      await UserModel.findByIdAndDelete(student.userId).session(session);

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      revalidatePath("/dashboard/students");

      return {
        success: true,
        message: "Student deleted successfully",
      };
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Delete Student Error:", error);
    return {
      success: false,
      message: "Failed to delete student",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
