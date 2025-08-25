"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getExamResults } from "@/lib/action/exam.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import ExamResultsTable from "@/components/dashboard/exams/ExamResultsTable"
import ExamResultsStats from "@/components/dashboard/exams/ExamResultsStats"
import ExamResultForm from "@/components/dashboard/exams/ExamResultForm"
import { toast } from "sonner"
import { ArrowLeft, FileText, Loader2, UserPlus } from "lucide-react"

interface ExamResultsPageProps {
  params: {
    id: string
  }
}

export default function ExamResultsPage({ params }: ExamResultsPageProps) {
  const { id } = params
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [examData, setExamData] = useState<any>(null)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("results")

  const fetchResults = async () => {
    setLoading(true)
    try {
      const response = await getExamResults(id)
      if (response.success) {
        setExamData(response)
        setError(null)
      } else {
         setError(response.error || "Failed to load exam results")
         toast.error("Error loading results", {
           description: response.error || "Failed to load exam results.",
         })
       }
     } catch (err) {
       console.error("Error fetching exam results:", err)
       setError("An unexpected error occurred")
       toast.error("Network Error", {
         description: "An unexpected error occurred while fetching results.",
       })
     } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResults()
  }, [id])

  const handleAddResult = (student: any) => {
    setSelectedStudent(student)
    setActiveTab("add")
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error || !examData) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" className="mr-4" asChild>
            <Link href={`/dashboard/exams/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Exam
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Exam Results</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error || "Failed to load exam results"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { exam, studentsWithResults, statistics } = examData

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" className="mr-4" asChild>
          <Link href={`/dashboard/exams/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exam
          </Link>
        </Button>
         <h1 className="text-3xl font-bold tracking-tight flex-1">{exam.title} - Results</h1>
         <Button
           onClick={() => {
             const ungraded = studentsWithResults.find((item: any) => !item.result) // Add type 'any' to item
              if (ungraded) {
                handleAddResult(ungraded)
              } else {
               toast.info("Information", {
                 description: "All students have been graded for this exam.",
               })
             }
           }}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Record New Result
        </Button>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Exam Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Course</p>
                <p className="font-medium">
                  {exam.courseId.name} ({exam.courseId.code})
                </p>
              </div>
              {exam.classId && (
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="font-medium">{exam.classId.name}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Total Marks</p>
                <p className="font-medium">{exam.totalMarks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="results">
            <FileText className="h-4 w-4 mr-2" />
            Results
          </TabsTrigger>
          {selectedStudent && (
            <TabsTrigger value="add">
              <UserPlus className="h-4 w-4 mr-2" />
              {selectedStudent.result ? "Edit Result" : "Add Result"}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="results" className="space-y-6">
          <ExamResultsStats statistics={statistics} totalMarks={exam.totalMarks} />

          <Separator className="my-6" />

          <Card>
            <CardHeader>
              <CardTitle>Student Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ExamResultsTable
                examId={id}
                totalMarks={exam.totalMarks}
                passingMarks={exam.passingMarks}
                studentsWithResults={studentsWithResults}
                onRefresh={fetchResults}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          {selectedStudent && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedStudent.result ? "Edit Result" : "Record Result"} for {selectedStudent.student.firstName}{" "}
                  {selectedStudent.student.lastName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ExamResultForm
                  examId={id}
                  studentId={selectedStudent.student._id}
                  studentName={`${selectedStudent.student.firstName} ${selectedStudent.student.lastName}`}
                  totalMarks={exam.totalMarks}
                  passingMarks={exam.passingMarks}
                  existingResult={selectedStudent.result}
                  onSuccess={() => {
                    fetchResults()
                    setActiveTab("results")
                    setSelectedStudent(null)
                  }}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
