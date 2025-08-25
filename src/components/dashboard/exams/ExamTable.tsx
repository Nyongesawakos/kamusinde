"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { deleteExam } from "@/lib/action/exam.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { MoreHorizontal, Eye, Edit, Trash2, FileText, Calendar, Clock } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface ExamTableProps {
  exams: any[]
}

export default function ExamTable({ exams }: ExamTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (examId: string) => {
    if (confirm("Are you sure you want to delete this exam? This action cannot be undone.")) {
      setDeletingId(examId)
      try {
         const response = await deleteExam(examId)
         if (response.success) {
           toast.success("Success", {
             description: "Exam deleted successfully",
           })
           router.refresh()
         } else {
           toast.error("Error deleting exam", {
             description: response.error || "Failed to delete the exam.",
           })
         }
       } catch (error) {
         console.error("Error deleting exam:", error)
         toast.error("Deletion Error", {
           description: "An unexpected error occurred while deleting the exam.",
         })
       } finally {
        setDeletingId(null)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Scheduled
          </Badge>
        )
      case "ongoing":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Ongoing
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exams</CardTitle>
      </CardHeader>
      <CardContent>
        {exams.length === 0 ? (
          <div className="text-center py-10">
            <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No exams found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new exam.</p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/dashboard/exams/new">Create New Exam</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam._id}>
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/exams/${exam._id}`} className="hover:underline text-primary">
                        {exam.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {exam.courseId?.name}
                      <span className="text-xs text-gray-500 block">{exam.courseId?.code}</span>
                    </TableCell>
                    <TableCell className="capitalize">{exam.examType}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{format(new Date(exam.examDate), "dd MMM yyyy")}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          {exam.startTime} - {exam.endTime}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(exam.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/exams/${exam._id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/exams/${exam._id}/results`}>
                              <FileText className="h-4 w-4 mr-2" />
                              View Results
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/exams/${exam._id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Exam
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(exam._id)}
                            disabled={deletingId === exam._id || exam.status === "completed"}
                            className="text-red-600 focus:text-red-600"
                          >
                            {deletingId === exam._id ? (
                              <>Deleting...</>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Exam
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
