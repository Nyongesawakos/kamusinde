// src/app/dashboard/courses/[id]/edit/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import CourseForm from "@/components/dashboard/courses/CourseForm";
import { getCourseById } from "@/lib/action/course.actions";

export default async function EditCoursePage({
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
        <h2 className="text-3xl font-bold tracking-tight">Edit Course</h2>
        <Link href={`/dashboard/courses/${params.id}`}>
          <Button variant="outline" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Course Information</CardTitle>
          <CardDescription>
            Update the details of {course.name} ({course.courseCode}). All
            fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourseForm initialData={course} isEditing={true} />
        </CardContent>
      </Card>
    </div>
  );
}
