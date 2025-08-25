import type React from "react";
// src/app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import type { UserRole } from "@/types"; // Import from types file instead of database model

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  // If no session, redirect to login
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  // Check if user role is set
  if (!session.user.role) {
    // Handle case where role is missing - could redirect to an error page
    redirect("/auth/error?error=MissingRole");
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <DashboardSidebar userRole={session.user.role as UserRole} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader user={session.user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
