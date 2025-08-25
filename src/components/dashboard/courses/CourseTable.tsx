"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  BookOpen,
  Eye,
} from "lucide-react";
import { deleteCourse } from "@/lib/action/course.actions";
import { toast } from "sonner";

interface CourseTableProps {
  data: {
    courses: any[];
    departments: string[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
  searchParams: {
    page?: string;
    search?: string;
    department?: string;
    isActive?: string;
  };
}

// Create a client component that uses router
function CourseTableContent({ data, searchParams }: CourseTableProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { courses, pagination } = data;

  const handleDeleteClick = (course: any) => {
    setCourseToDelete({
      id: course._id,
      name: course.name,
    });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteCourse(courseToDelete.id);

      if (result.success) {
        toast.success(result.message);
        // Refresh the page to show updated data
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    params.set("page", page.toString());
    router.push(`/dashboard/courses?${params.toString()}`);
  };

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
          <BookOpen className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        </div>
        <h3 className="mt-4 text-lg font-medium">No courses found</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {searchParams.search || searchParams.department
            ? "Try adjusting your search or filters"
            : "Get started by adding a new course"}
        </p>
        <Link href="/dashboard/courses/new">
          <Button className="mt-4 bg-[#295E4F] hover:bg-[#1f4a3f]">
            Add Course
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Teachers</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course._id}>
                <TableCell className="font-medium">
                  {course.courseCode}
                </TableCell>
                <TableCell>{course.name}</TableCell>
                <TableCell>{course.department || "Not assigned"}</TableCell>
                <TableCell>{course.credits}</TableCell>
                <TableCell>
                  {course.isActive ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {course.teachers && course.teachers.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {course.teachers.slice(0, 2).map((teacher: any) => (
                        <span key={teacher._id} className="text-xs">
                          {teacher.firstName} {teacher.lastName}
                        </span>
                      ))}
                      {course.teachers.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{course.teachers.length - 2} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No teachers assigned
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/courses/${course._id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/courses/${course._id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => handleDeleteClick(course)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} courses
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
              (page) => (
                <Button
                  key={page}
                  variant={page === pagination.page ? "default" : "outline"}
                  size="icon"
                  onClick={() => handlePageChange(page)}
                  className={
                    page === pagination.page
                      ? "bg-[#295E4F] hover:bg-[#1f4a3f]"
                      : ""
                  }
                >
                  {page}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the course{" "}
              <span className="font-medium">{courseToDelete?.name}</span> (
              {courseToDelete?.id}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Main component with Suspense
export default function CourseTable({ data, searchParams }: CourseTableProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="rounded-md border">
            <div className="h-10 bg-gray-100 dark:bg-gray-800 flex items-center px-4 border-b">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <CourseTableContent data={data} searchParams={searchParams} />
    </Suspense>
  );
}
