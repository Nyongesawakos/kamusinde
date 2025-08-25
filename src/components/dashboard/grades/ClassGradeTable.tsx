"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, PlusCircle } from "lucide-react"
import { getClassGrades } from "@/lib/action/grade.actions"

interface ClassGradeTableProps {
  classId: string
  initialData?: any
}

export default function ClassGradeTable({ classId, initialData }: ClassGradeTableProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(!initialData)
  const [data, setData] = useState<any>(initialData || {})
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all")
  const [selectedTerm, setSelectedTerm] = useState<string>("all")

  // Function to get grade color based on grade letter
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A":
        return "bg-green-100 text-green-800 border-green-200"
      case "B+":
      case "B":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "C+":
      case "C":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "D+":
      case "D":
        return "bg-amber-100 text-amber-800 border-amber-200"
      default:
        return "bg-red-100 text-red-800 border-red-200"
    }
  }

  // Load class grades if not provided
  useEffect(() => {
    if (!initialData) {
      const loadGrades = async () => {
        setLoading(true)
        try {
          const result = await getClassGrades(classId)
          if (result.success) {
            setData(result.data)
          } else {
            console.error("Failed to load grades:", result.message)
          }
        } catch (error) {
          console.error("Error loading grades:", error)
        } finally {
          setLoading(false)
        }
      }

      loadGrades()
    }
  }, [classId, initialData])

  // Filter grades based on selected course and term
  const filteredStudents = Object.values(data.gradesByStudent || {}).filter((studentData: any) => {
    if (selectedCourseId === "all" && selectedTerm === "all") return true

    // Filter by course
    if (selectedCourseId !== "all") {
      if (!studentData.courses[selectedCourseId]) return false

      // Also filter by term if selected
      if (selectedTerm !== "all") {
        return studentData.courses[selectedCourseId].grades.some((grade: any) => grade.term === selectedTerm)
      }

      return true
    }

    // Filter only by term
    if (selectedTerm !== "all") {
      return Object.values(studentData.courses).some((courseData: any) =>
        courseData.grades.some((grade: any) => grade.term === selectedTerm),
      )
    }

    return true
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data.classDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Class Grades</CardTitle>
          <CardDescription>No class data found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              The requested class could not be found or you don't have permission to view it.
            </p>
            <Button asChild>
              <Link href="/dashboard/grades">Back to Grades</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle>
            {data.classDetails.name} - {data.classDetails.academicYear}
          </CardTitle>
          <CardDescription>Grades for {data.students?.length || 0} students</CardDescription>
        </div>
        <Button asChild>
          <Link href={`/dashboard/grades/new?classId=${classId}`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Record Grade
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/2">
            <label className="text-sm font-medium mb-1 block">Filter by Course</label>
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {data.courses?.map((course: any) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.name} ({course.courseCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-1/2">
            <label className="text-sm font-medium mb-1 block">Filter by Term</label>
            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger>
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Terms</SelectItem>
                {data.terms?.map((term: string) => (
                  <SelectItem key={term} value={term}>
                    {term}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-6 border rounded-md">
            <p className="text-muted-foreground">No grades found for the selected filters.</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Student</TableHead>
                  {selectedCourseId === "all" ? (
                    <TableHead colSpan={data.courses?.length || 1} className="text-center">
                      Courses
                    </TableHead>
                  ) : (
                    <>
                      <TableHead>Course Details</TableHead>
                      <TableHead>Exam Type</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Grade</TableHead>
                    </>
                  )}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((studentData: any) => (
                  <TableRow key={studentData.student._id}>
                    <TableCell>
                      <div className="font-medium">
                        {studentData.student.firstName} {studentData.student.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">{studentData.student.registrationNumber}</div>
                    </TableCell>

                    {selectedCourseId === "all" ? (
                      <>
                        {data.courses?.map((course: any) => {
                          const courseGrades = studentData.courses[course._id]?.grades || []
                          const filteredGrades =
                            selectedTerm === "all"
                              ? courseGrades
                              : courseGrades.filter((g: any) => g.term === selectedTerm)

                          // Get the latest grade for display
                          const latestGrade =
                            filteredGrades.length > 0
                              ? filteredGrades.reduce((latest: any, current: any) =>
                                  new Date(current.updatedAt) > new Date(latest.updatedAt) ? current : latest,
                                )
                              : null

                          return (
                            <TableCell key={course._id} className="text-center">
                              {latestGrade ? (
                                <Badge variant="outline" className={getGradeColor(latestGrade.grade)}>
                                  {latestGrade.grade}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-xs">N/A</span>
                              )}
                            </TableCell>
                          )
                        })}
                      </>
                    ) : (
                      <>
                        <TableCell>
                          {studentData.courses[selectedCourseId] ? (
                            <>
                              <div className="font-medium">{studentData.courses[selectedCourseId].course.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {studentData.courses[selectedCourseId].course.courseCode}
                              </div>
                            </>
                          ) : (
                            <span className="text-muted-foreground">Not enrolled</span>
                          )}
                        </TableCell>

                        <TableCell>
                          {studentData.courses[selectedCourseId] ? (
                            <div>
                              {selectedTerm === "all"
                                ? studentData.courses[selectedCourseId].grades.map((g: any) => g.examType).join(", ")
                                : studentData.courses[selectedCourseId].grades
                                    .filter((g: any) => g.term === selectedTerm)
                                    .map((g: any) => g.examType)
                                    .join(", ")}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>

                        <TableCell>
                          {studentData.courses[selectedCourseId] ? (
                            <div>
                              {selectedTerm === "all"
                                ? studentData.courses[selectedCourseId].grades.map((g: any, i: number) => (
                                    <div key={i} className="text-sm">
                                      {g.score}/{g.maxScore} ({g.percentage.toFixed(1)}%)
                                    </div>
                                  ))
                                : studentData.courses[selectedCourseId].grades
                                    .filter((g: any) => g.term === selectedTerm)
                                    .map((g: any, i: number) => (
                                      <div key={i} className="text-sm">
                                        {g.score}/{g.maxScore} ({g.percentage.toFixed(1)}%)
                                      </div>
                                    ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>

                        <TableCell>
                          {studentData.courses[selectedCourseId] ? (
                            <div>
                              {selectedTerm === "all"
                                ? studentData.courses[selectedCourseId].grades.map((g: any, i: number) => (
                                    <Badge key={i} variant="outline" className={getGradeColor(g.grade)}>
                                      {g.grade}
                                    </Badge>
                                  ))
                                : studentData.courses[selectedCourseId].grades
                                    .filter((g: any) => g.term === selectedTerm)
                                    .map((g: any, i: number) => (
                                      <Badge key={i} variant="outline" className={getGradeColor(g.grade)}>
                                        {g.grade}
                                      </Badge>
                                    ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </>
                    )}

                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/grades/student/${studentData.student._id}`}>View All</Link>
                      </Button>
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
