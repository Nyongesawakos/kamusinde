import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, PlusCircle } from "lucide-react"
import ClassGradeTable from "@/components/dashboard/grades/ClassGradeTable"
import { getClassGrades } from "@/lib/action/grade.actions"
import { connectToDatabase } from "@/lib/mongoose"
import ClassModel from "@/database/models/Class.model"

export const metadata: Metadata = {
  title: "Class Grades | School Management System",
  description: "View and manage grades for a class",
}

interface ClassGradesPageProps {
  params: {
    id: string
  }
}

export default async function ClassGradesPage({ params }: ClassGradesPageProps) {
  const { id } = params

  // Fetch class data
  await connectToDatabase()
  const classData = await ClassModel.findById(id).lean()

  if (!classData) {
    notFound()
  }

  // Fetch grades data
  const gradesResult = await getClassGrades(id)
  const gradesData = gradesResult.success ? gradesResult.data : null

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2">
            <Link href="/dashboard/grades">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Grades
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Class Grades: {classData.name}</h1>
          <p className="text-muted-foreground">
            View and manage grades for {classData.name} - {classData.academicYear}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild>
            <Link href={`/dashboard/grades/new?classId=${id}`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Record Grade
            </Link>
          </Button>
        </div>
      </div>

      <ClassGradeTable classId={id} initialData={gradesData} />
    </div>
  )
}
