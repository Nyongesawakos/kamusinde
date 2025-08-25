import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, FileText, School, User } from "lucide-react"
import GradeReport from "@/components/dashboard/grades/GradeReport"
import { getGradeFormData } from "@/lib/action/grade.actions"

export const metadata: Metadata = {
  title: "Grades | School Management System",
  description: "Manage student grades and academic performance",
}

export default async function GradesPage() {
  const formDataResult = await getGradeFormData()
  const formData = formDataResult.success ? formDataResult.data : { classes: [], courses: [] }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grades Management</h1>
          <p className="text-muted-foreground">Record and manage student grades and academic performance</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button asChild>
            <Link href="/dashboard/grades/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Record Grade
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Classes</CardTitle>
                <CardDescription>View grades by class</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {formData.classes.length > 0 ? (
                    formData.classes.map((cls: any) => (
                      <Button key={cls._id} variant="outline" asChild className="w-full justify-start">
                        <Link href={`/dashboard/grades/class/${cls._id}`}>
                          <School className="mr-2 h-4 w-4" />
                          {cls.name} ({cls.academicYear})
                        </Link>
                      </Button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">No classes found</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Courses</CardTitle>
                <CardDescription>View grades by course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {formData.courses.length > 0 ? (
                    formData.courses.map((course: any) => (
                      <Button key={course._id} variant="outline" asChild className="w-full justify-start">
                        <Link href={`/dashboard/grades/course/${course._id}`}>
                          <FileText className="mr-2 h-4 w-4" />
                          {course.name} ({course.courseCode})
                        </Link>
                      </Button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">No courses found</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Grade management tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/dashboard/grades/new">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Record New Grade
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/dashboard/students">
                      <User className="mr-2 h-4 w-4" />
                      View Student Profiles
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/dashboard/grades?tab=reports">
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Reports
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Grade Entries</CardTitle>
              <CardDescription>View and manage recently recorded grades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border p-8 text-center">
                <h3 className="text-lg font-medium">Grade Data Loading</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Select a class or course to view detailed grade information
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <Button asChild>
                    <Link href="/dashboard/grades/new">Record New Grade</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <GradeReport />
        </TabsContent>
      </Tabs>
    </div>
  )
}
