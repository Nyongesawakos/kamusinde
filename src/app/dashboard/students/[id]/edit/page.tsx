// src/app/dashboard/students/[id]/edit/page.tsx
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
import StudentForm from "@/components/dashboard/students/StudentForm";
import { getStudentById } from "@/lib/action/student.actions";

export default async function EditStudentPage({
  params,
}: {
  params: { id: string };
}) {
  const param = await params;
  const result = await getStudentById(param.id);

  if (!result.success) {
    notFound();
  }

  const student = result.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Edit Student</h2>
        <Link href={`/dashboard/students/${param.id}`}>
          <Button variant="outline" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Student
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Student Information</CardTitle>
          <CardDescription>
            Update the details of {student.firstName} {student.lastName}. All
            fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudentForm initialData={student} isEditing={true} />
        </CardContent>
      </Card>
    </div>
  );
}
