import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import GradeForm from "@/components/dashboard/grades/GradeForm"
import { connectToDatabase } from "@/lib/mongoose"
import GradeModel from "@/database/models/Grade.model"

export const metadata: Metadata = {
  title: "Edit Grade | School Management System",
  description: "Edit an existing grade record",
}

interface EditGradePageProps {
  params: {
    id: string
  }
}

export default async function EditGradePage({ params }: EditGradePageProps) {
  const { id } = params

  // Fetch grade data
  await connectToDatabase()
  const grade = await GradeModel.findById(id)
    .populate("student", "firstName lastName registrationNumber")
    .populate("course", "name courseCode")
    .populate("class", "name academicYear")
    .lean()

  if (!grade) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link href="/dashboard/grades">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Grades
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Grade</h1>
        <p className="text-muted-foreground">
          Update the grade details for {grade.student.firstName} {grade.student.lastName}
        </p>
      </div>

      <GradeForm initialData={grade} />
    </div>
  )
}
