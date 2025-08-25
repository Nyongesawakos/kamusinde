import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getClassById, getAllActiveTeachers } from "@/lib/action/class.actions"
import ClassForm from "@/components/dashboard/classes/ClassForm"

interface EditClassPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: EditClassPageProps): Promise<Metadata> {
  try {
    const classData = await getClassById(params.id)
    return {
      title: `Edit ${classData.name} | School Management System`,
      description: `Edit class ${classData.name}`,
    }
  } catch (error) {
    return {
      title: "Class Not Found | School Management System",
      description: "The requested class could not be found",
    }
  }
}

export default async function EditClassPage({ params }: EditClassPageProps) {
  try {
    // Fetch class data and teachers
    const [classData, teachers] = await Promise.all([getClassById(params.id), getAllActiveTeachers()])

    // Ensure data is plain objects before passing to Client Component
    const plainClassData = JSON.parse(JSON.stringify(classData))
    const plainTeachers = JSON.parse(JSON.stringify(teachers))

    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Edit Class: {plainClassData.name}</h1>
        </div>

        <ClassForm initialData={plainClassData} teachers={plainTeachers} />
      </div>
    )
  } catch (error) {
    notFound()
  }
}
