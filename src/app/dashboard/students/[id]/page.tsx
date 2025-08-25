import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CalendarClock, GraduationCap, Pencil, User, FileText } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getStudentById } from "@/lib/action/student.actions"
import AcademicTab from "@/components/dashboard/students/tabs/AcademicTab"
import AttendanceTab from "@/components/dashboard/students/tabs/AttendanceTab"
import FeesTab from "@/components/dashboard/students/tabs/FeesTab"
import DisciplinaryTab from "@/components/dashboard/students/tabs/DisciplinaryTab"
import StudentExamResults from "@/components/dashboard/exams/StudentExamResults"

export default async function StudentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const result = await getStudentById(params.id)

  if (!result.success) {
    notFound()
  }

  const student = result.data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/students">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Student Profile</h2>
        </div>
        <Link href={`/dashboard/students/${params.id}/edit`}>
          <Button className="bg-[#295E4F] hover:bg-[#1f4a3f]">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Student
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Student Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={undefined || "/placeholder.svg"} alt={`${student.firstName} ${student.lastName}`} />
                <AvatarFallback className="bg-[#295E4F] text-white text-xl">
                  {student.firstName.charAt(0)}
                  {student.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="mt-4 text-2xl">
              {student.firstName} {student.lastName}
            </CardTitle>
            <CardDescription>
              <Badge variant="outline" className="mt-1">
                {student.form} {student.stream && `- ${student.stream}`}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Admission No:</span>
                <span className="font-medium">{student.admissionNumber}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium">
                  {student.hostel && student.hostel !== "None" ? `Boarder - ${student.hostel}` : "Day Scholar"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Enrolled:</span>
                <span className="font-medium">{new Date(student.enrollmentDate).toLocaleDateString()}</span>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Email: </span>
                    <span className="font-medium">{student.user?.email}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Parent Contact: </span>
                    <span className="font-medium">{student.parentContact || "Not provided"}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Address: </span>
                    <span className="font-medium">{student.address || "Not provided"}</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Details Tabs */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>View detailed information about this student.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="academic">
              <TabsList className="mb-4">
                <TabsTrigger value="academic">Academic</TabsTrigger>
                <TabsTrigger value="exams">
                  <FileText className="h-4 w-4 mr-2" />
                  Exams
                </TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="fees">Fees</TabsTrigger>
                <TabsTrigger value="disciplinary">Disciplinary</TabsTrigger>
              </TabsList>

              <TabsContent value="academic">
                <AcademicTab studentId={params.id} />
              </TabsContent>

              <TabsContent value="exams">
                <StudentExamResults studentId={params.id} />
              </TabsContent>

              <TabsContent value="attendance">
                <AttendanceTab studentId={params.id} />
              </TabsContent>

              <TabsContent value="fees">
                <FeesTab studentId={params.id} />
              </TabsContent>

              <TabsContent value="disciplinary">
                <DisciplinaryTab studentId={params.id} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
