// src/lib/action/fee.actions.ts
"use server";

import { connectToDatabase } from "../mongoose";
import FeeModel from "@/database/models/Fee.model";
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

// --- Get Student Fees ---
export async function getStudentFees(
  studentId: string,
  academicYear?: string
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

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return {
        success: false,
        message: "Invalid student ID",
      };
    }

    // Build query
    const query: any = { student: studentId };

    if (academicYear) {
      query.academicYear = academicYear;
    }

    // Fetch fee records
    const feeRecords = await FeeModel.find(query)
      .populate("recordedBy", "name")
      .sort({ academicYear: -1, term: -1, dueDate: 1 })
      .lean();

    // Group fees by academic year and term
    const groupedFees: Record<string, Record<string, any[]>> = {};

    feeRecords.forEach((fee) => {
      if (!groupedFees[fee.academicYear]) {
        groupedFees[fee.academicYear] = {};
      }

      if (!groupedFees[fee.academicYear][fee.term]) {
        groupedFees[fee.academicYear][fee.term] = [];
      }

      groupedFees[fee.academicYear][fee.term].push(fee);
    });

    // Calculate fee statistics
    let totalAmount = 0;
    let totalPaid = 0;
    let totalBalance = 0;

    feeRecords.forEach((fee) => {
      totalAmount += fee.amount;
      totalPaid += fee.paidAmount;
      totalBalance += fee.balance;
    });

    // Get payment history (records with paidAmount > 0)
    const paymentHistory = feeRecords
      .filter((fee) => fee.paidAmount > 0)
      .sort((a, b) => {
        if (!a.paymentDate || !b.paymentDate) return 0;
        return (
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
        );
      });

    // Get upcoming fees (with due dates in the future)
    const now = new Date();
    const upcomingFees = feeRecords
      .filter((fee) => fee.balance > 0 && new Date(fee.dueDate) > now)
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );

    // Get overdue fees (with due dates in the past and balance > 0)
    const overdueFees = feeRecords
      .filter((fee) => fee.balance > 0 && new Date(fee.dueDate) < now)
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );

    return {
      success: true,
      message: "Student fees retrieved successfully",
      data: {
        records: feeRecords,
        groupedFees,
        stats: {
          totalAmount,
          totalPaid,
          totalBalance,
          paymentPercentage:
            totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0,
        },
        paymentHistory,
        upcomingFees,
        overdueFees,
      },
    };
  } catch (error) {
    console.error("Get Student Fees Error:", error);
    return {
      success: false,
      message: "Failed to retrieve student fees",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// --- Get Student Fee Summary ---
export async function getStudentFeeSummary(
  studentId: string
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

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return {
        success: false,
        message: "Invalid student ID",
      };
    }

    // Get current academic year and term
    // This is a simplification - in a real system, you'd have a settings table
    // or some other way to determine the current academic year and term
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentAcademicYear = `${currentYear}-${currentYear + 1}`;

    // Determine current term based on month
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    let currentTerm = "Term 1";

    if (currentMonth >= 9 && currentMonth <= 12) {
      currentTerm = "Term 1";
    } else if (currentMonth >= 1 && currentMonth <= 4) {
      currentTerm = "Term 2";
    } else {
      currentTerm = "Term 3";
    }

    // Get fee records for current term
    const currentTermFees = await FeeModel.find({
      student: studentId,
      academicYear: currentAcademicYear,
      term: currentTerm,
    }).lean();

    // Calculate current term statistics
    let termTotalAmount = 0;
    let termTotalPaid = 0;
    let termTotalBalance = 0;

    currentTermFees.forEach((fee) => {
      termTotalAmount += fee.amount;
      termTotalPaid += fee.paidAmount;
      termTotalBalance += fee.balance;
    });

    // Get next upcoming payment
    const now = new Date();
    const upcomingPayment = await FeeModel.findOne({
      student: studentId,
      balance: { $gt: 0 },
      dueDate: { $gt: now },
    })
      .sort({ dueDate: 1 })
      .lean();

    // Get most overdue payment
    const overduePayment = await FeeModel.findOne({
      student: studentId,
      balance: { $gt: 0 },
      dueDate: { $lt: now },
    })
      .sort({ dueDate: 1 })
      .lean();

    // Get payment status
    let paymentStatus = "current";
    if (overduePayment) {
      const daysOverdue = Math.floor(
        (now.getTime() - new Date(overduePayment.dueDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (daysOverdue > 30) {
        paymentStatus = "critical";
      } else {
        paymentStatus = "overdue";
      }
    } else if (termTotalBalance === 0) {
      paymentStatus = "paid";
    }

    return {
      success: true,
      message: "Student fee summary retrieved successfully",
      data: {
        currentTerm: {
          academicYear: currentAcademicYear,
          term: currentTerm,
          totalAmount: termTotalAmount,
          totalPaid: termTotalPaid,
          totalBalance: termTotalBalance,
          paymentPercentage:
            termTotalAmount > 0 ? (termTotalPaid / termTotalAmount) * 100 : 0,
        },
        paymentStatus,
        upcomingPayment,
        overduePayment,
      },
    };
  } catch (error) {
    console.error("Get Student Fee Summary Error:", error);
    return {
      success: false,
      message: "Failed to retrieve student fee summary",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
