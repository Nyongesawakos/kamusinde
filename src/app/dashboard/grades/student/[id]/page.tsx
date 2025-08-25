import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, PlusCircle } from "lucide-react"
import GradeTable from "@/components/dashboard/grades/GradeTable"
import { getStudentGrades } from "@/lib/action/grade.actions"
import { connectToDatabase } from "@/lib/mongoose"
import StudentModel from "@/database/models/Student.model"

export const metadata: Metadata = {
  title: "Student Grades | School Management System",
  description: "View and manage grades for a student",
}

interface StudentGradesPageProps {
  params: {
    id: string
  }
}

export default async function StudentGradesPage({ params }: StudentGradesPageProps) {
  const { id } = params

  // Fetch student data
  await connectToDatabase()
  const student = await StudentModel.findById(id).populate("classId", "name academicYear").lean()

  if (!student) {
    notFound()
  }

  // Fetch grades data
  const gradesResult = await getStudentGrades(id)
  const grades = gradesResult.success ? gradesResult.data.grades : []

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
          <h1 className="text-3xl font-bold tracking-tight">Student Grades</h1>
          <p className="text-muted-foreground">
            Grades for {student.firstName} {student.lastName} ({student.registrationNumber})
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild>
            <Link href={`/dashboard/grades/new?studentId=${id}`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Record Grade
            </Link>
          </Button>
        </div>
      </div>

      <GradeTable grades={grades} showStudent={false} />
    </div>
  )
}
