import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import GradeForm from "@/components/dashboard/grades/GradeForm"

export const metadata: Metadata = {
  title: "Record Grade | School Management System",
  description: "Record a new grade for a student",
}

interface NewGradePageProps {
  searchParams: {
    studentId?: string
    classId?: string
    courseId?: string
  }
}

export default function NewGradePage({ searchParams }: NewGradePageProps) {
  const { studentId, classId, courseId } = searchParams

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link href="/dashboard/grades">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Grades
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Record New Grade</h1>
        <p className="text-muted-foreground">Enter grade details for a student</p>
      </div>

      <GradeForm studentId={studentId} classId={classId} courseId={courseId} />
    </div>
  )
}
