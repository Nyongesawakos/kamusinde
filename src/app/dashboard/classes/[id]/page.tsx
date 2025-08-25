import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getClassById } from "@/lib/action/class.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Edit, Users, BookOpen, Calendar } from "lucide-react"

interface ClassDetailPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ClassDetailPageProps): Promise<Metadata> {
  try {
    const classData = await getClassById(params.id)
    return {
      title: `${classData.name} | School Management System`,
      description: `Details for class ${classData.name}`,
    }
  } catch (error) {
    return {
      title: "Class Not Found | School Management System",
      description: "The requested class could not be found",
    }
  }
}

export default async function ClassDetailPage({ params }: ClassDetailPageProps) {
  try {
    const classData = await getClassById(params.id)

    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{classData.name}</h1>
            <p className="text-muted-foreground">
              {classData.form} • {classData.academicYear}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button asChild variant="outline">
              <Link href={`/dashboard/classes/${params.id}/students`}>
                <Users className="h-4 w-4 mr-2" />
                Manage Students
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/dashboard/classes/${params.id}/courses`}>
                <BookOpen className="h-4 w-4 mr-2" />
                Manage Courses
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/dashboard/classes/${params.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Class
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Class Details</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Basic details about the class</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Class Name</p>
                      <p className="text-lg font-medium">{classData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Academic Year</p>
                      <p className="text-lg font-medium">{classData.academicYear}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Form/Grade</p>
                      <p className="text-lg font-medium">{classData.form}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Stream</p>
                      <p className="text-lg font-medium">{classData.stream || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Capacity</p>
                      <p className="text-lg font-medium">{classData.capacity || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge variant={classData.isActive ? "default" : "secondary"}>
                        {classData.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Class Teacher</CardTitle>
                  <CardDescription>Teacher assigned to this class</CardDescription>
                </CardHeader>
                <CardContent>
                  {classData.classTeacher ? (
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Name</p>
                        <p className="text-lg font-medium">
                          {classData.classTeacher.firstName} {classData.classTeacher.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p className="text-base">{classData.classTeacher.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p className="text-base">{classData.classTeacher.phoneNumber || "N/A"}</p>
                      </div>
                      <Button asChild variant="outline" size="sm" className="mt-2">
                        <Link href={`/dashboard/teachers/${classData.classTeacher._id}`}>View Teacher Profile</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <p className="text-muted-foreground mb-2">No class teacher assigned</p>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/classes/${params.id}/edit`}>Assign Class Teacher</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {classData.schedule && classData.schedule.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Class Schedule</CardTitle>
                  <CardDescription>Weekly schedule for this class</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classData.schedule.map((item: any, index: number) => (
                      <div key={index} className="border rounded-md p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="font-medium">
                            {item.day}
                          </Badge>
                          {item.room && <span className="text-sm text-muted-foreground">Room: {item.room}</span>}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {item.startTime} - {item.endTime}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="students" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Students</CardTitle>
                  <CardDescription>Students enrolled in this class</CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/dashboard/classes/${params.id}/students`}>
                    <Users className="h-4 w-4 mr-2" />
                    Manage Students
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {classData.students && classData.students.length > 0 ? (
                  <div className="border rounded-md divide-y">
                    {classData.students.map((student: any) => (
                      <div key={student._id} className="p-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{student.admissionNumber}</p>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/dashboard/students/${student._id}`}>View</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">No students assigned to this class</p>
                    <Button asChild>
                      <Link href={`/dashboard/classes/${params.id}/students`}>Assign Students</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Courses</CardTitle>
                  <CardDescription>Courses taught in this class</CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/dashboard/classes/${params.id}/courses`}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Manage Courses
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {classData.courses && classData.courses.length > 0 ? (
                  <div className="border rounded-md divide-y">
                    {classData.courses.map((course: any) => (
                      <div key={course._id} className="p-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{course.name}</p>
                          <p className="text-sm text-muted-foreground">{course.code}</p>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/dashboard/courses/${course._id}`}>View</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">No courses assigned to this class</p>
                    <Button asChild>
                      <Link href={`/dashboard/classes/${params.id}/courses`}>Assign Courses</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
