"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteExamResult } from "@/lib/action/exam.actions"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { MoreHorizontal, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import ExamResultForm from "./ExamResultForm"

interface ExamResultsTableProps {
  examId: string
  totalMarks: number
  passingMarks: number
  studentsWithResults: any[]
  onRefresh: () => void
}

export default function ExamResultsTable({
  examId,
  totalMarks,
  passingMarks,
  studentsWithResults,
  onRefresh,
}: ExamResultsTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingStudent, setEditingStudent] = useState<any | null>(null)


  const handleDelete = async (resultId: string) => {
    if (confirm("Are you sure you want to delete this result? This action cannot be undone.")) {
      setDeletingId(resultId)
      try {
        const response = await deleteExamResult(resultId)
        if (response.success) {
          toast.success("Success",{
            description: "Result deleted successfully",
          })
           onRefresh()
         } else {
           toast.error("Error deleting result", {
             description: response.error || "Failed to delete the result.",
           })
         }
       } catch (error) {
         console.error("Error deleting result:", error)
         toast.error("Deletion Error", {
           description: "An unexpected error occurred while deleting the result.",
         })
       } finally {
        setDeletingId(null)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pass":
        return (
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Pass
            </Badge>
          </div>
        )
      case "fail":
        return (
          <div className="flex items-center">
            <XCircle className="h-4 w-4 text-red-500 mr-1" />
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              Fail
            </Badge>
          </div>
        )
      case "absent":
        return (
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-orange-500 mr-1" />
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              Absent
            </Badge>
          </div>
        )
      case "incomplete":
        return (
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-blue-500 mr-1" />
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Incomplete
            </Badge>
          </div>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (editingStudent) {
    return (
      <div className="mt-4">
        <ExamResultForm
          examId={examId}
          studentId={editingStudent.student._id}
          studentName={`${editingStudent.student.firstName} ${editingStudent.student.lastName}`}
          totalMarks={totalMarks}
          passingMarks={passingMarks}
          existingResult={editingStudent.result}
          onSuccess={() => {
            setEditingStudent(null)
            onRefresh()
          }}
        />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Registration No.</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead className="text-center">Marks</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {studentsWithResults.map((item) => (
            <TableRow key={item.student._id}>
              <TableCell className="font-mono">{item.student.registrationNumber}</TableCell>
              <TableCell>
                {item.student.firstName} {item.student.lastName}
              </TableCell>
              <TableCell className="text-center">
                {item.result ? (
                  <span
                    className={
                      item.result.status === "pass" ? "text-green-600 font-medium" : "text-red-600 font-medium"
                    }
                  >
                    {item.result.marksObtained} / {totalMarks}
                  </span>
                ) : (
                  <span className="text-gray-400">Not graded</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {item.result ? (
                  getStatusBadge(item.result.status)
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                    Pending
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingStudent(item)}>
                      <Edit className="h-4 w-4 mr-2" />
                      {item.result ? "Edit Result" : "Record Result"}
                    </DropdownMenuItem>
                    {item.result && (
                      <DropdownMenuItem
                        onClick={() => handleDelete(item.result._id)}
                        disabled={deletingId === item.result._id}
                        className="text-red-600 focus:text-red-600"
                      >
                        {deletingId === item.result._id ? (
                          <>Deleting...</>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Result
                          </>
                        )}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
