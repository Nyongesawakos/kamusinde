// src/app/dashboard/courses/page.tsx
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
import { BookOpen, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import CourseTable from "@/components/dashboard/courses/CourseTable";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllCourses } from "@/lib/action/course.actions";

// Loading component for Suspense
function CoursesTableSkeleton() {
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

// Courses data fetcher component
async function CoursesData({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
    department?: string;
    isActive?: string;
  };
}) {
  const page = searchParams.page ? Number.parseInt(searchParams.page) : 1;
  const search = searchParams.search || "";
  const department = searchParams.department || "";
  const isActive =
    searchParams.isActive === "true"
      ? true
      : searchParams.isActive === "false"
      ? false
      : undefined;

  const result = await getAllCourses(page, 10, search, department, isActive);

  if (!result.success) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-red-800">
        <p>Error: {result.message}</p>
      </div>
    );
  }

  return <CourseTable data={result.data} searchParams={searchParams} />;
}

export default function CoursesPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
    department?: string;
    isActive?: string;
  };
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Courses</h2>
        <Link href="/dashboard/courses/new">
          <Button className="bg-[#295E4F] hover:bg-[#1f4a3f]">
            <BookOpen className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Management</CardTitle>
          <CardDescription>
            View, add, edit, and manage all courses in the system.
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
                    placeholder="Search by course code or name..."
                    className="w-full pl-9"
                    defaultValue={searchParams.search || ""}
                  />
                </form>
              </div>
              <div className="flex gap-2">
                <Select
                  name="department"
                  defaultValue={searchParams.department || ""}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Languages">Languages</SelectItem>
                    <SelectItem value="Humanities">Humanities</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  name="isActive"
                  defaultValue={searchParams.isActive || ""}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Button type="submit" variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Courses Table */}
            <Suspense fallback={<CoursesTableSkeleton />}>
              <CoursesData searchParams={searchParams} />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
