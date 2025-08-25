import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, PlusCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getCourseGrades } from "@/lib/action/grade.actions"
import { connectToDatabase } from "@/lib/mongoose"
import CourseModel from "@/database/models/Course.model"

export const metadata: Metadata = {
  title: "Course Grades | School Management System",
  description: "View and manage grades for a course",
}

interface CourseGradesPageProps {
  params: {
    id: string
  }
}

export default async function CourseGradesPage({ params }: CourseGradesPageProps) {
  const { id } = params

  // Fetch course data
  await connectToDatabase()
  const course = await CourseModel.findById(id).lean()

  if (!course) {
    notFound()
  }

  // Fetch grades data
  const gradesResult = await getCourseGrades(id)
  const data = gradesResult.success ? gradesResult.data : { classes: [], gradesByClass: {} }

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

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2">
            <Link href="/dashboard/grades">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Grades
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Course Grades</h1>
          <p className="text-muted-foreground">
            Grades for {course.name} ({course.courseCode})
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild>
            <Link href={`/dashboard/grades/new?courseId=${id}`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Record Grade
            </Link>
          </Button>
        </div>
      </div>

      {Object.keys(data.gradesByClass).length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Course Grades</CardTitle>
            <CardDescription>No grades found for this course</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">No students have been graded for this course yet.</p>
              <Button asChild>
                <Link href={`/dashboard/grades/new?courseId=${id}`}>Record First Grade</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={Object.keys(data.gradesByClass)[0]} className="space-y-6">
          <TabsList className="w-full justify-start overflow-auto">
            {Object.entries(data.gradesByClass).map(([classId, classData]: [string, any]) => (
              <TabsTrigger key={classId} value={classId} className="min-w-[120px]">
                {classData.class.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(data.gradesByClass).map(([classId, classData]: [string, any]) => (
            <TabsContent key={classId} value={classId} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {classData.class.name} - {classData.class.academicYear}
                  </CardTitle>
                  <CardDescription>
                    Grades for {course.name} ({course.courseCode})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue={Object.keys(classData.terms)[0]} className="space-y-4">
                    <TabsList>
                      {Object.keys(classData.terms).map((term) => (
                        <TabsTrigger key={term} value={term}>
                          {term}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {Object.entries(classData.terms).map(([term, termData]: [string, any]) => (
                      <TabsContent key={term} value={term}>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Exam Type</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Object.values(termData.students).map((studentData: any) => (
                                <TableRow key={studentData.student._id}>
                                  <TableCell>
                                    <div className="font-medium">
                                      {studentData.student.firstName} {studentData.student.lastName}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {studentData.student.registrationNumber}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {studentData.grades.map((grade: any, index: number) => (
                                      <div key={index} className="text-sm">
                                        {grade.examType}
                                      </div>
                                    ))}
                                  </TableCell>
                                  <TableCell>
                                    {studentData.grades.map((grade: any, index: number) => (
                                      <div key={index} className="text-sm">
                                        {grade.score}/{grade.maxScore} ({grade.percentage.toFixed(1)}%)
                                      </div>
                                    ))}
                                  </TableCell>
                                  <TableCell>
                                    {studentData.grades.map((grade: any, index: number) => (
                                      <div key={index} className="mb-1">
                                        <Badge variant="outline" className={getGradeColor(grade.grade)}>
                                          {grade.grade}
                                        </Badge>
                                      </div>
                                    ))}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button asChild variant="ghost" size="sm">
                                      <Link href={`/dashboard/grades/student/${studentData.student._id}`}>
                                        View All
                                      </Link>
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
