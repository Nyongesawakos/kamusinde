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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { deleteTeacher } from "@/lib/action/teacher.actions";
import { toast } from "sonner";

interface TeacherTableProps {
  data: {
    teachers: any[];
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
    subject?: string;
  };
}

// Create a client component that uses router
function TeacherTableContent({ data, searchParams }: TeacherTableProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { teachers, pagination } = data;

  const handleDeleteClick = (teacher: any) => {
    setTeacherToDelete({
      id: teacher._id,
      name: `${teacher.firstName} ${teacher.lastName}`,
    });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!teacherToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteTeacher(teacherToDelete.id);

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
      setTeacherToDelete(null);
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    params.set("page", page.toString());
    router.push(`/dashboard/teachers?${params.toString()}`);
  };

  if (teachers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
          <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        </div>
        <h3 className="mt-4 text-lg font-medium">No teachers found</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {searchParams.search || searchParams.subject
            ? "Try adjusting your search or filters"
            : "Get started by adding a new teacher"}
        </p>
        <Link href="/dashboard/teachers/new">
          <Button className="mt-4 bg-[#295E4F] hover:bg-[#1f4a3f]">
            Add Teacher
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
              <TableHead>Name</TableHead>
              <TableHead>Staff ID</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead>Qualification</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((teacher) => (
              <TableRow key={teacher._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={undefined || "/placeholder.svg"}
                        alt={`${teacher.firstName} ${teacher.lastName}`}
                      />
                      <AvatarFallback className="bg-[#295E4F] text-white">
                        {teacher.firstName.charAt(0)}
                        {teacher.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {teacher.firstName} {teacher.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {teacher.specialization &&
                        teacher.specialization.length > 0
                          ? teacher.specialization.join(", ")
                          : "No specialization"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{teacher.staffId}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {teacher.subjects && teacher.subjects.length > 0 ? (
                      teacher.subjects
                        .slice(0, 2)
                        .map((subject: string, index: number) => (
                          <Badge key={index} variant="outline" className="mr-1">
                            {subject}
                          </Badge>
                        ))
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        No subjects assigned
                      </span>
                    )}
                    {teacher.subjects && teacher.subjects.length > 2 && (
                      <Badge variant="outline">
                        +{teacher.subjects.length - 2} more
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {teacher.qualification || "Not specified"}
                </TableCell>
                <TableCell>{teacher.contactNumber || "Not provided"}</TableCell>
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
                        <Link href={`/dashboard/teachers/${teacher._id}`}>
                          <User className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/teachers/${teacher._id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => handleDeleteClick(teacher)}
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
            {pagination.total} teachers
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
              This will permanently delete the teacher record for{" "}
              <span className="font-medium">{teacherToDelete?.name}</span>. This
              action cannot be undone.
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
export default function TeacherTable({
  data,
  searchParams,
}: TeacherTableProps) {
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
      <TeacherTableContent data={data} searchParams={searchParams} />
    </Suspense>
  );
}
