import type { Metadata } from "next"
import { getClasses } from "@/lib/action/class.actions"
import ClassTable from "@/components/dashboard/classes/ClassTable"

export const metadata: Metadata = {
  title: "Classes | School Management System",
  description: "Manage school classes and sections",
}

interface ClassesPageProps {
  searchParams: {
    page?: string
    search?: string
    academicYear?: string
    form?: string
  }
}

export default async function ClassesPage({ searchParams }: ClassesPageProps) {
  // Parse search params
  const page = searchParams.page ? Number.parseInt(searchParams.page) : 1
  const search = searchParams.search || ""
  const academicYear = searchParams.academicYear || ""
  const form = searchParams.form || ""

  // Fetch classes with pagination and filtering
  const { classes, totalPages, currentPage } = await getClasses({
    page,
    limit: 10,
    search,
    academicYear,
    form,
  })

  // Get unique academic years from classes
  const academicYears = Array.from(new Set(classes.map((classItem: any) => classItem.academicYear)))
    .sort()
    .reverse()

  // Get unique form levels from classes
  const formLevels = Array.from(new Set(classes.map((classItem: any) => classItem.form))).sort()

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
      </div>

      <ClassTable
        classes={classes}
        totalPages={totalPages}
        currentPage={currentPage}
        academicYears={academicYears}
        formLevels={formLevels}
      />
    </div>
  )
}
