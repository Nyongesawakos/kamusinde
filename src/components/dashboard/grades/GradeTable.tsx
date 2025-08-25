"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Pencil, MoreHorizontal, Trash2, Eye } from "lucide-react"
import { deleteGrade } from "@/lib/action/grade.actions"

interface GradeTableProps {
  grades: any[]
  showStudent?: boolean
  showCourse?: boolean
  showClass?: boolean
  showActions?: boolean
}

export default function GradeTable({
  grades,
  showStudent = true,
  showCourse = true,
  showClass = false,
  showActions = true,
}: GradeTableProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Function to get grade color based on percentage
  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-100 text-green-800 border-green-200"
    if (percentage >= 70) return "bg-emerald-100 text-emerald-800 border-emerald-200"
    if (percentage >= 60) return "bg-blue-100 text-blue-800 border-blue-200"
    if (percentage >= 50) return "bg-amber-100 text-amber-800 border-amber-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  // Handle grade deletion
  const handleDelete = async (id: string) => {
    setLoading(true)
    try {
      const result = await deleteGrade(id)
      if (result.success) {
        router.refresh()
      } else {
        console.error("Failed to delete grade:", result.message)
      }
    } catch (error) {
      console.error("Error deleting grade:", error)
    } finally {
      setLoading(false)
      setDeleteId(null)
    }
  }

  if (grades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grades</CardTitle>
          <CardDescription>No grades found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              No grade records found. Start by adding grades for students.
            </p>
            <Button asChild>
              <Link href="/dashboard/grades/new">Record New Grade</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grades</CardTitle>
        <CardDescription>View and manage student grades</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {showStudent && <TableHead>Student</TableHead>}
                {showCourse && <TableHead>Course</TableHead>}
                {showClass && <TableHead>Class</TableHead>}
                <TableHead>Term</TableHead>
                <TableHead>Exam Type</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Grade</TableHead>
                {showActions && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((grade) => (
                <TableRow key={grade._id}>
                  {showStudent && (
                    <TableCell>
                      <div className="font-medium">
                        {grade.student?.firstName} {grade.student?.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">{grade.student?.registrationNumber}</div>
                    </TableCell>
                  )}

                  {showCourse && (
                    <TableCell>
                      <div className="font-medium">{grade.course?.name}</div>
                      <div className="text-xs text-muted-foreground">{grade.course?.courseCode}</div>
                    </TableCell>
                  )}

                  {showClass && (
                    <TableCell>
                      <div className="font-medium">{grade.class?.name}</div>
                      <div className="text-xs text-muted-foreground">{grade.academicYear}</div>
                    </TableCell>
                  )}

                  <TableCell>{grade.term}</TableCell>

                  <TableCell>{grade.examType}</TableCell>

                  <TableCell>
                    <div className="font-medium">
                      {grade.score}/{grade.maxScore}
                    </div>
                    <div className="text-xs text-muted-foreground">{grade.percentage?.toFixed(1)}%</div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className={getGradeColor(grade.percentage)}>
                      {grade.grade}
                    </Badge>
                  </TableCell>

                  {showActions && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>

                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/students/${grade.student?._id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Student
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/grades/edit/${grade._id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Grade
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <AlertDialog
                            open={deleteId === grade._id}
                            onOpenChange={(open) => !open && setDeleteId(null)}
                          >
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault()
                                  setDeleteId(grade._id)
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Grade
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the grade record.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(grade._id)}
                                  disabled={loading}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
