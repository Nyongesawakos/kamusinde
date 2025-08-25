// src/app/dashboard/teachers/[id]/page.tsx
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
import { ArrowLeft, Book, Calendar, GraduationCap, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getTeacherById } from "@/lib/action/teacher.actions";

export default async function TeacherDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getTeacherById(params.id);

  if (!result.success) {
    notFound();
  }

  const teacher = result.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/teachers">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Teacher Profile</h2>
        </div>
        <Link href={`/dashboard/teachers/${params.id}/edit`}>
          <Button className="bg-[#295E4F] hover:bg-[#1f4a3f]">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Teacher
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Teacher Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={undefined || "/placeholder.svg"}
                  alt={`${teacher.firstName} ${teacher.lastName}`}
                />
                <AvatarFallback className="bg-[#295E4F] text-white text-xl">
                  {teacher.firstName.charAt(0)}
                  {teacher.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="mt-4 text-2xl">
              {teacher.firstName} {teacher.lastName}
            </CardTitle>
            <CardDescription>
              <Badge variant="outline" className="mt-1">
                Staff ID: {teacher.staffId}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Qualification:</span>
                <span className="font-medium">
                  {teacher.qualification || "Not specified"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Book className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Specialization:</span>
                <span className="font-medium">
                  {teacher.specialization && teacher.specialization.length > 0
                    ? teacher.specialization.join(", ")
                    : "Not specified"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Joined:</span>
                <span className="font-medium">
                  {new Date(teacher.joiningDate).toLocaleDateString()}
                </span>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">
                  Contact Information
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Email: </span>
                    <span className="font-medium">{teacher.user?.email}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Phone: </span>
                    <span className="font-medium">
                      {teacher.contactNumber || "Not provided"}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Address: </span>
                    <span className="font-medium">
                      {teacher.address || "Not provided"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teacher Details Tabs */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Teacher Information</CardTitle>
            <CardDescription>
              View detailed information about this teacher.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="subjects">
              <TabsList className="mb-4">
                <TabsTrigger value="subjects">Subjects</TabsTrigger>
                <TabsTrigger value="classes">Classes</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="subjects" className="space-y-4">
                <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
                  <h3 className="text-sm font-medium mb-2">
                    Assigned Subjects
                  </h3>
                  {teacher.subjects && teacher.subjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {teacher.subjects.map(
                        (subject: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center p-2 rounded-md bg-white dark:bg-gray-700 shadow-sm"
                          >
                            <Book className="h-4 w-4 mr-2 text-[#295E4F]" />
                            <span>{subject}</span>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No subjects assigned to this teacher yet.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="classes" className="space-y-4">
                <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
                  <h3 className="text-sm font-medium mb-2">Assigned Classes</h3>
                  <p className="text-sm text-muted-foreground">
                    No classes assigned yet. Classes will appear here once
                    assigned.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
                  <h3 className="text-sm font-medium mb-2">
                    Teaching Schedule
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No schedule information available. Schedule will appear here
                    once created.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
                  <h3 className="text-sm font-medium mb-2">
                    Performance Metrics
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No performance data available yet. Performance metrics will
                    appear here once recorded.
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
