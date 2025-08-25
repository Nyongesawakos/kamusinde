// src/app/dashboard/teachers/[id]/edit/page.tsx
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
import TeacherForm from "@/components/dashboard/teachers/TeacherForm";
import { getTeacherById } from "@/lib/action/teacher.actions";

export default async function EditTeacherPage({
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
        <h2 className="text-3xl font-bold tracking-tight">Edit Teacher</h2>
        <Link href={`/dashboard/teachers/${params.id}`}>
          <Button variant="outline" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Teacher
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Teacher Information</CardTitle>
          <CardDescription>
            Update the details of {teacher.firstName} {teacher.lastName}. All
            fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeacherForm initialData={teacher} isEditing={true} />
        </CardContent>
      </Card>
    </div>
  );
}
