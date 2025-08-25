// src/lib/actions/teacher.actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../mongoose";
import TeacherModel from "@/database/models/Teacher.model";
import UserModel from "@/database/models/User.model";
import { getServerSession } from "../auth";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { UserRole } from "@/types";

// --- Validation Schemas ---
const TeacherSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  staffId: z.string().min(2, { message: "Staff ID is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  address: z.string().optional(),
  contactNumber: z.string().optional(),
  qualification: z.string().optional(),
  specialization: z.array(z.string()).optional(),
  joiningDate: z.string().optional(),
  subjects: z.array(z.string()).optional(),
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
async function checkAuthorization(allowedRoles: UserRole[] = [UserRole.ADMIN]) {
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

// --- Create Teacher ---
export async function createTeacher(formData: unknown): Promise<ActionResult> {
  // Check authorization
  const auth = await checkAuthorization();
  if (!auth.authorized) {
    return {
      success: false,
      message: auth.message ?? "Not authorized",
    };
  }

  // Validate input
  const validationResult = TeacherSchema.safeParse(formData);
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
    staffId,
    email,
    dateOfBirth,
    gender,
    address,
    contactNumber,
    qualification,
    specialization,
    joiningDate,
    subjects,
    password,
  } = validationResult.data;

  try {
    await connectToDatabase();

    // Check if teacher with staff ID already exists
    const existingTeacher = await TeacherModel.findOne({ staffId });
    if (existingTeacher) {
      return {
        success: false,
        message: "Teacher with this staff ID already exists",
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
      role: UserRole.TEACHER,
    });

    // Create teacher record
    const newTeacher = await TeacherModel.create({
      userId: newUser._id,
      firstName,
      lastName,
      staffId,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      address,
      contactNumber,
      qualification,
      specialization,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      subjects,
    });

    revalidatePath("/dashboard/teachers");

    return {
      success: true,
      message: "Teacher created successfully",
      data: newTeacher,
    };
  } catch (error) {
    console.error("Create Teacher Error:", error);
    return {
      success: false,
      message: "Failed to create teacher",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// --- Get All Teachers ---
export async function getAllTeachers(
  page = 1,
  limit = 10,
  search = "",
  subject = ""
): Promise<ActionResult> {
  // Check authorization
  const auth = await checkAuthorization([UserRole.ADMIN, UserRole.STAFF]);
  if (!auth.authorized) {
    return {
      success: false,
      message: auth.message ?? "Not authorized",
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
        { staffId: { $regex: search, $options: "i" } },
      ];
    }

    if (subject) {
      query.subjects = subject;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const teachers = await TeacherModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalTeachers = await TeacherModel.countDocuments(query);

    return {
      success: true,
      message: "Teachers retrieved successfully",
      data: {
        teachers,
        pagination: {
          total: totalTeachers,
          page,
          limit,
          pages: Math.ceil(totalTeachers / limit),
        },
      },
    };
  } catch (error) {
    console.error("Get Teachers Error:", error);
    return {
      success: false,
      message: "Failed to retrieve teachers",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// --- Get Teacher By ID ---
export async function getTeacherById(id: string): Promise<ActionResult> {
  // Check authorization
  const auth = await checkAuthorization([UserRole.ADMIN, UserRole.STAFF]);
  if (!auth.authorized) {
    return {
      success: false,
      message: auth.message ?? "Not authorized",
    };
  }

  try {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        success: false,
        message: "Invalid teacher ID",
      };
    }

    const teacher = await TeacherModel.findById(id).lean();

    if (!teacher) {
      return {
        success: false,
        message: "Teacher not found",
      };
    }

    // Get user data
    const user = await UserModel.findById(teacher.userId)
      .select("-password")
      .lean();

    return {
      success: true,
      message: "Teacher retrieved successfully",
      data: {
        ...teacher,
        user,
      },
    };
  } catch (error) {
    console.error("Get Teacher Error:", error);
    return {
      success: false,
      message: "Failed to retrieve teacher",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// --- Update Teacher ---
export async function updateTeacher(
  id: string,
  formData: unknown
): Promise<ActionResult> {
  // Check authorization
  const auth = await checkAuthorization();
  if (!auth.authorized) {
    return {
      success: false,
      message: auth.message ?? "Not authorized",
    };
  }

  // Validate input
  const UpdateTeacherSchema = TeacherSchema.partial().omit({
    password: true,
    email: true,
  });
  const validationResult = UpdateTeacherSchema.safeParse(formData);

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
        message: "Invalid teacher ID",
      };
    }

    const teacher = await TeacherModel.findById(id);

    if (!teacher) {
      return {
        success: false,
        message: "Teacher not found",
      };
    }

    // Check if staff ID is being changed and if it's already in use
    if (
      validationResult.data.staffId &&
      validationResult.data.staffId !== teacher.staffId
    ) {
      const existingTeacher = await TeacherModel.findOne({
        staffId: validationResult.data.staffId,
        _id: { $ne: id },
      });

      if (existingTeacher) {
        return {
          success: false,
          message: "Teacher with this staff ID already exists",
        };
      }
    }

    // Update teacher
    const updatedTeacher = await TeacherModel.findByIdAndUpdate(
      id,
      {
        ...validationResult.data,
        dateOfBirth: validationResult.data.dateOfBirth
          ? new Date(validationResult.data.dateOfBirth)
          : teacher.dateOfBirth,
        joiningDate: validationResult.data.joiningDate
          ? new Date(validationResult.data.joiningDate)
          : teacher.joiningDate,
      },
      { new: true }
    );

    // Update user name if first or last name changed
    if (validationResult.data.firstName || validationResult.data.lastName) {
      const firstName = validationResult.data.firstName || teacher.firstName;
      const lastName = validationResult.data.lastName || teacher.lastName;

      await UserModel.findByIdAndUpdate(teacher.userId, {
        name: `${firstName} ${lastName}`,
      });
    }

    revalidatePath(`/dashboard/teachers/${id}`);
    revalidatePath("/dashboard/teachers");

    return {
      success: true,
      message: "Teacher updated successfully",
      data: updatedTeacher,
    };
  } catch (error) {
    console.error("Update Teacher Error:", error);
    return {
      success: false,
      message: "Failed to update teacher",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// --- Delete Teacher ---
export async function deleteTeacher(id: string): Promise<ActionResult> {
  // Check authorization
  const auth = await checkAuthorization([UserRole.ADMIN]); // Only admin can delete
  if (!auth.authorized) {
    return {
      success: false,
      message: auth.message ?? "Not authorized",
    };
  }

  try {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        success: false,
        message: "Invalid teacher ID",
      };
    }

    const teacher = await TeacherModel.findById(id);

    if (!teacher) {
      return {
        success: false,
        message: "Teacher not found",
      };
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete teacher
      await TeacherModel.findByIdAndDelete(id).session(session);

      // Delete associated user
      await UserModel.findByIdAndDelete(teacher.userId).session(session);

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      revalidatePath("/dashboard/teachers");

      return {
        success: true,
        message: "Teacher deleted successfully",
      };
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Delete Teacher Error:", error);
    return {
      success: false,
      message: "Failed to delete teacher",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
