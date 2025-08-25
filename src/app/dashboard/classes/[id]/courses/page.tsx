import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getClassById, getAllActiveCourses } from "@/lib/action/class.actions"
import CourseAssignment from "@/components/dashboard/classes/CourseAssignment"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface ManageCoursesPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ManageCoursesPageProps): Promise<Metadata> {
  try {
    const classData = await getClassById(params.id)
    return {
      title: `Manage Courses - ${classData.name} | School Management System`,
      description: `Assign courses to class ${classData.name}`,
    }
  } catch (error) {
    return {
      title: "Class Not Found | School Management System",
      description: "The requested class could not be found",
    }
  }
}

export default async function ManageCoursesPage({ params }: ManageCoursesPageProps) {
  try {
    // Fetch class data and all active courses
    const [classData, allCourses] = await Promise.all([getClassById(params.id), getAllActiveCourses()])

    // Get courses already assigned to this class
    // Ensure data is plain objects before passing to Client Component
    const plainAllCourses = JSON.parse(JSON.stringify(allCourses))
    const plainAssignedCourses = JSON.parse(JSON.stringify(classData.courses || []))

    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Button asChild variant="ghost" size="sm" className="mb-2">
              <Link href={`/dashboard/classes/${params.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Class
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Manage Courses</h1>
            <p className="text-muted-foreground">
              {classData.name} • {classData.form} • {classData.academicYear}
            </p>
          </div>
        </div>

        <CourseAssignment classId={params.id} availableCourses={plainAllCourses} assignedCourses={plainAssignedCourses} />
      </div>
    )
  } catch (error) {
    notFound()
  }
}
