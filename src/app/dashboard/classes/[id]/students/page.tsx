import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getClassById, getUnassignedStudents, getStudentsInClass } from "@/lib/action/class.actions"
import StudentAssignment from "@/components/dashboard/classes/StudentAssignment"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface ManageStudentsPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ManageStudentsPageProps): Promise<Metadata> {
  try {
    const classData = await getClassById(params.id)
    return {
      title: `Manage Students - ${classData.name} | School Management System`,
      description: `Assign students to class ${classData.name}`,
    }
  } catch (error) {
    return {
      title: "Class Not Found | School Management System",
      description: "The requested class could not be found",
    }
  }
}

export default async function ManageStudentsPage({ params }: ManageStudentsPageProps) {
  try {
    // Fetch class data, unassigned students, and students in this class
    const [classData, unassignedStudents, studentsInClass] = await Promise.all([
      getClassById(params.id),
      getUnassignedStudents(),
      getStudentsInClass(params.id),
    ])

    // Combine unassigned students with students already in this class
    const availableStudents = [...unassignedStudents, ...studentsInClass]

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
            <h1 className="text-3xl font-bold tracking-tight">Manage Students</h1>
            <p className="text-muted-foreground">
              {classData.name} • {classData.form} • {classData.academicYear}
            </p>
          </div>
        </div>

        <StudentAssignment
          classId={params.id}
          availableStudents={availableStudents}
          assignedStudents={studentsInClass}
        />
      </div>
    )
  } catch (error) {
    notFound()
  }
}
