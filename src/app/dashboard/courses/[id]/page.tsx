// src/app/dashboard/courses/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCourseById } from "@/lib/action/course.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function CourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getCourseById(params.id);

  if (!result.success) {
    notFound();
  }

  const course = result.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/courses">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Course Details</h2>
        </div>
        <Link href={`/dashboard/courses/${params.id}/edit`}>
          <Button className="bg-[#295E4F] hover:bg-[#1f4a3f]">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Course
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Course Info Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{course.courseCode}</CardTitle>
                <CardDescription className="mt-1">
                  {course.name}
                </CardDescription>
              </div>
              <Badge
                className={
                  course.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {course.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Department
                </h3>
                <p className="mt-1">{course.department || "Not assigned"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Credits
                </h3>
                <p className="mt-1">{course.credits}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Level
                </h3>
                <p className="mt-1">{course.level || "Not specified"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Duration
                </h3>
                <p className="mt-1">{course.duration || "Not specified"}</p>
              </div>

              {course.prerequisites && course.prerequisites.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Prerequisites
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {course.prerequisites.map(
                      (prereq: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {prereq}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Course Details Tabs */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>
              View detailed information about this course.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="description">
              <TabsList className="mb-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="teachers">Teachers</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="materials">Materials</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="space-y-4">
                <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
                  <h3 className="text-sm font-medium mb-2">
                    Course Description
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {course.description ||
                      "No description available for this course."}
                  </p>
                </div>

                {course.syllabus && (
                  <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800 mt-4">
                    <h3 className="text-sm font-medium mb-2">Syllabus</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {course.syllabus}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="teachers" className="space-y-4">
                <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
                  <h3 className="text-sm font-medium mb-2">
                    Assigned Teachers
                  </h3>
                  {course.teachers && course.teachers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {course.teachers.map((teacher: any) => (
                        <div
                          key={teacher._id}
                          className="flex items-center gap-3 p-3 rounded-md bg-white dark:bg-gray-700 shadow-sm"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={undefined || "/placeholder.svg"}
                              alt={`${teacher.firstName} ${teacher.lastName}`}
                            />
                            <AvatarFallback className="bg-[#295E4F] text-white">
                              {teacher.firstName?.charAt(0)}
                              {teacher.lastName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {teacher.firstName} {teacher.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Staff ID: {teacher.staffId}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No teachers assigned to this course yet.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="students" className="space-y-4">
                <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
                  <h3 className="text-sm font-medium mb-2">
                    Enrolled Students
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No students enrolled yet. Students will appear here once
                    enrolled.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="materials" className="space-y-4">
                <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
                  <h3 className="text-sm font-medium mb-2">Course Materials</h3>
                  <p className="text-sm text-muted-foreground">
                    No course materials available yet. Materials will appear
                    here once added.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
