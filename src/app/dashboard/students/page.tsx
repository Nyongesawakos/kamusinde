// src/app/dashboard/students/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";

import StudentTable from "@/components/dashboard/students/StudentTable";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllStudents } from "@/lib/action/student.actions";

// Loading component for Suspense
function StudentsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="rounded-md border">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}

// Students data fetcher component
async function StudentsData({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
    form?: string;
    stream?: string;
  };
}) {
  const page = searchParams.page ? Number.parseInt(searchParams.page) : 1;
  const search = searchParams.search || "";
  const form = searchParams.form || "";
  const stream = searchParams.stream || "";

  const result = await getAllStudents(page, 10, search, form, stream);

  if (!result.success) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-red-800">
        <p>Error: {result.message}</p>
      </div>
    );
  }

  return <StudentTable data={result.data} searchParams={searchParams} />;
}

export default function StudentsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
    form?: string;
    stream?: string;
  };
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Students</h2>
        <Link href="/dashboard/students/new">
          <Button className="bg-[#295E4F] hover:bg-[#1f4a3f]">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Management</CardTitle>
          <CardDescription>
            View, add, edit, and manage all students in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <form className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="search"
                    name="search"
                    placeholder="Search by name or admission number..."
                    className="w-full pl-9"
                    defaultValue={searchParams.search || ""}
                  />
                </form>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
                {/* Add more filter buttons as needed */}
              </div>
            </div>

            {/* Students Table */}
            <Suspense fallback={<StudentsTableSkeleton />}>
              <StudentsData searchParams={searchParams} />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
