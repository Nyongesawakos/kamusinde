import Link from "next/link"
import { getExams } from "@/lib/action/exam.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ExamTable from "@/components/dashboard/exams/ExamTable"
import { PlusCircle } from "lucide-react"

export const metadata = {
  title: "Exams Management",
  description: "Manage school exams and assessments",
}

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string }
}) {
  const page = searchParams.page ? Number.parseInt(searchParams.page) : 1
  const limit = searchParams.limit ? Number.parseInt(searchParams.limit) : 10

  const { success, exams = [], totalPages = 1, currentPage = 1, error } = await getExams(page, limit)

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exams Management</h1>
          <p className="text-muted-foreground">Create and manage exams for your courses</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/exams/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Exam
          </Link>
        </Button>
      </div>

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load exams</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <ExamTable exams={exams} />

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex space-x-2">
                {currentPage > 1 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/exams?page=${currentPage - 1}&limit=${limit}`}>Previous</Link>
                  </Button>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Button key={pageNum} variant={pageNum === currentPage ? "default" : "outline"} size="sm" asChild>
                    <Link href={`/dashboard/exams?page=${pageNum}&limit=${limit}`}>{pageNum}</Link>
                  </Button>
                ))}

                {currentPage < totalPages && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/exams?page=${currentPage + 1}&limit=${limit}`}>Next</Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
