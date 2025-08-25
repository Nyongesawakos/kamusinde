import Link from "next/link"
import { notFound } from "next/navigation"
import { getExamById } from "@/lib/action/exam.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { Edit, FileText, ArrowLeft, Clock, Calendar, BookOpen, Users, Award } from "lucide-react"

interface ExamDetailsPageProps {
  params: {
    id: string
  }
}

export default async function ExamDetailsPage({ params }: ExamDetailsPageProps) {
  const { id } = params
  const { success, exam, error } = await getExamById(id)

  if (!success || !exam) {
    notFound()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Scheduled</Badge>
      case "ongoing":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ongoing</Badge>
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" className="mr-4" asChild>
          <Link href="/dashboard/exams">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight flex-1">{exam.title}</h1>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/exams/${id}/results`}>
              <FileText className="mr-2 h-4 w-4" />
              View Results
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/exams/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Exam
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Exam Details</CardTitle>
              <CardDescription>Comprehensive information about this exam</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="capitalize">
                  {exam.examType}
                </Badge>
                {getStatusBadge(exam.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Course</h3>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-primary" />
                    <p>
                      {exam.courseId.name} ({exam.courseId.code})
                    </p>
                  </div>
                </div>

                {exam.classId && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Class</h3>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-primary" />
                      <p>
                        {exam.classId.name} ({exam.classId.academicYear})
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Date</h3>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    <p>{format(new Date(exam.examDate), "EEEE, MMMM d, yyyy")}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Time</h3>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <p>
                      {exam.startTime} - {exam.endTime} ({exam.duration} minutes)
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Marks</h3>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-2 text-primary" />
                    <p>{exam.totalMarks}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Passing Marks</h3>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-2 text-primary" />
                    <p>{exam.passingMarks}</p>
                  </div>
                </div>
              </div>

              {exam.description && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                    <p className="text-sm">{exam.description}</p>
                  </div>
                </>
              )}

              {exam.instructions && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Instructions</h3>
                    <div className="text-sm whitespace-pre-line">{exam.instructions}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Exam Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Created By</h3>
                <p>{exam.createdBy?.name || "System"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Created At</h3>
                <p>{format(new Date(exam.createdAt), "MMM d, yyyy")}</p>
              </div>

              <Separator />

              <div className="pt-2">
                <Button className="w-full" asChild>
                  <Link href={`/dashboard/exams/${id}/results`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Manage Results
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
