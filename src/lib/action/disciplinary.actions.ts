// src/lib/action/disciplinary.actions.ts
"use server";

import { connectToDatabase } from "../mongoose";
import DisciplinaryRecordModel from "@/database/models/DisciplinaryRecord.model";
import { getServerSession } from "../auth";
import { UserRole } from "@/types";
import mongoose from "mongoose";

// --- Types for Action Results ---
interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string | null;
}

// --- Check Authorization ---
async function checkAuthorization(
  allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.STAFF, UserRole.TEACHER]
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

// --- Get Student Disciplinary Records ---
export async function getStudentDisciplinaryRecords(
  studentId: string
): Promise<ActionResult> {
  // Check authorization
  const auth = await checkAuthorization();
  if (!auth.authorized) {
    return {
      success: false,
      message: auth.message ?? "Authorization failed",
    };
  }

  try {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return {
        success: false,
        message: "Invalid student ID",
      };
    }

    // Fetch disciplinary records
    const records = await DisciplinaryRecordModel.find({ student: studentId })
      .populate("reportedBy", "name")
      .populate("resolvedBy", "name")
      .sort({ date: -1 })
      .lean();

    // Group records by status
    const pendingRecords = records.filter(
      (record) => record.status === "pending"
    );
    const inProgressRecords = records.filter(
      (record) => record.status === "in-progress"
    );
    const resolvedRecords = records.filter(
      (record) => record.status === "resolved"
    );

    // Group records by academic year
    // This is a simplification - in a real system, you'd determine the academic year
    // based on the date and your school's academic calendar
    const groupedByYear: Record<string, any[]> = {};

    records.forEach((record) => {
      const date = new Date(record.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JavaScript months are 0-indexed

      // Determine academic year (assuming it starts in September)
      let academicYear;

      if (month >= 9) {
        academicYear = `${year}-${year + 1}`;
      } else {
        academicYear = `${year - 1}-${year}`;
      }

      if (!groupedByYear[academicYear]) {
        groupedByYear[academicYear] = [];
      }

      groupedByYear[academicYear].push(record);
    });

    return {
      success: true,
      message: "Student disciplinary records retrieved successfully",
      data: {
        records,
        pendingRecords,
        inProgressRecords,
        resolvedRecords,
        groupedByYear,
        totalRecords: records.length,
      },
    };
  } catch (error) {
    console.error("Get Student Disciplinary Records Error:", error);
    return {
      success: false,
      message: "Failed to retrieve student disciplinary records",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// --- Get Student Disciplinary Summary ---
export async function getStudentDisciplinarySummary(
  studentId: string
): Promise<ActionResult> {
  // Check authorization
  const auth = await checkAuthorization();
  if (!auth.authorized) {
    return {
      success: false,
      message: auth.message ?? "Authorization failed",
    };
  }

  try {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return {
        success: false,
        message: "Invalid student ID",
      };
    }

    // Get total number of records
    const totalRecords = await DisciplinaryRecordModel.countDocuments({
      student: studentId,
    });

    // Get active (non-resolved) records
    const activeRecords = await DisciplinaryRecordModel.countDocuments({
      student: studentId,
      status: { $ne: "resolved" },
    });

    // Get records from current academic year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    let currentAcademicYear;
    if (currentMonth >= 9) {
      currentAcademicYear = `${currentYear}-${currentYear + 1}`;
    } else {
      currentAcademicYear = `${currentYear - 1}-${currentYear}`;
    }

    // Get start and end dates for current academic year
    let startDate, endDate;
    if (currentMonth >= 9) {
      startDate = new Date(`${currentYear}-09-01`);
      endDate = new Date(`${currentYear + 1}-08-31`);
    } else {
      startDate = new Date(`${currentYear - 1}-09-01`);
      endDate = new Date(`${currentYear}-08-31`);
    }

    const currentYearRecords = await DisciplinaryRecordModel.countDocuments({
      student: studentId,
      date: { $gte: startDate, $lte: endDate },
    });

    // Get most recent record
    const mostRecentRecord = await DisciplinaryRecordModel.findOne({
      student: studentId,
    })
      .sort({ date: -1 })
      .populate("reportedBy", "name")
      .lean();

    // Get most serious active record (assuming suspension is most serious)
    const seriousActiveRecord = await DisciplinaryRecordModel.findOne({
      student: studentId,
      status: { $ne: "resolved" },
      action: "Suspension",
    })
      .sort({ date: -1 })
      .populate("reportedBy", "name")
      .lean();

    return {
      success: true,
      message: "Student disciplinary summary retrieved successfully",
      data: {
        totalRecords,
        activeRecords,
        currentYearRecords,
        mostRecentRecord,
        seriousActiveRecord,
        behaviorStatus: determineBehaviorStatus(
          totalRecords,
          activeRecords,
          seriousActiveRecord
        ),
      },
    };
  } catch (error) {
    console.error("Get Student Disciplinary Summary Error:", error);
    return {
      success: false,
      message: "Failed to retrieve student disciplinary summary",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Helper function to determine behavior status
function determineBehaviorStatus(
  totalRecords: number,
  activeRecords: number,
  seriousActiveRecord: any
): string {
  if (seriousActiveRecord) {
    return "serious";
  } else if (activeRecords >= 3) {
    return "concerning";
  } else if (totalRecords > 0 && activeRecords > 0) {
    return "attention";
  } else if (totalRecords > 0 && activeRecords === 0) {
    return "improved";
  } else {
    return "good";
  }
}
