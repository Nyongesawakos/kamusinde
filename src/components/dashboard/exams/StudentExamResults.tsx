"use client"

import { useState, useEffect } from "react"
import { getStudentExamResults } from "@/lib/action/exam.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Loader2, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react"

interface StudentExamResultsProps {
  studentId: string
}

export default function StudentExamResults({ studentId }: StudentExamResultsProps) {
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchResults() {
      setLoading(true)
      try {
        const response = await getStudentExamResults(studentId)
        if (response.success) {
          setResults(response.results)
        } else {
          setError(response.error || "Failed to load exam results")
        }
      } catch (err) {
        console.error("Error fetching student exam results:", err)
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [studentId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "fail":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "absent":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case "incomplete":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pass":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Pass
          </Badge>
        )
      case "fail":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Fail
          </Badge>
        )
      case "absent":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Absent
          </Badge>
        )
      case "incomplete":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Incomplete
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Exam Results</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Exam Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Exam Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No exam results found for this student.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exam Results</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-center">Marks</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result._id}>
                <TableCell>
                  <div className="font-medium">{result.examId.title}</div>
                  <div className="text-xs text-muted-foreground capitalize">{result.examId.examType}</div>
                </TableCell>
                <TableCell>
                  {result.examId.courseId.name}
                  <div className="text-xs text-muted-foreground">{result.examId.courseId.code}</div>
                </TableCell>
                <TableCell>{format(new Date(result.examId.examDate), "MMM d, yyyy")}</TableCell>
                <TableCell className="text-center">
                  <span
                    className={result.status === "pass" ? "text-green-600 font-medium" : "text-red-600 font-medium"}
                  >
                    {result.marksObtained} / {result.examId.totalMarks}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    {getStatusIcon(result.status)}
                    <span className="ml-1">{getStatusBadge(result.status)}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
