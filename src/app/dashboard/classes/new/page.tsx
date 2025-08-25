import type { Metadata } from "next"
import { getAllActiveTeachers } from "@/lib/action/class.actions"
import ClassForm from "@/components/dashboard/classes/ClassForm"

export const metadata: Metadata = {
  title: "Create Class | School Management System",
  description: "Create a new class in the school",
}

export default async function NewClassPage() {
  // Fetch active teachers for class teacher assignment
  const teachers = await getAllActiveTeachers()

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Create New Class</h1>
      </div>

      <ClassForm teachers={teachers} />
    </div>
  )
}
