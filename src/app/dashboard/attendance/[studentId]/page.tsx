import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { connectToDatabase } from "@/lib/mongoose"
import StudentModel from "@/database/models/Student.model"
import { getStudentAttendance } from "@/lib/action/attendance.actions"
import AttendanceTable from "@/components/dashboard/attendance/AttendanceTable"

interface StudentAttendancePageProps {
  params: {
    studentId: string
  }
}

async function getStudentDetails(studentId: string) {
  await connectToDatabase()

  const student = await StudentModel.findById(studentId).populate("currentClass", "name").lean()

  if (!student) {
    return null
  }

  return student
}

export default async function StudentAttendancePage({ params }: StudentAttendancePageProps) {
  const { studentId } = params

  const student = await getStudentDetails(studentId)

  if (!student) {
    notFound()
  }

  // Get last 30 days attendance by default
  const attendanceResult = await getStudentAttendance(studentId)

  if (!attendanceResult.success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/students">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Student Attendance</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load attendance data</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{attendanceResult.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { records, stats } = attendanceResult.data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/students">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Student Attendance</h2>
        </div>
        <Link href={`/dashboard/students/${studentId}`}>
          <Button variant="outline">
            <User className="mr-2 h-4 w-4" />
            View Student Profile
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">
                  {student.firstName} {student.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">{student.admissionNumber}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="font-medium">{student.currentClass ? student.currentClass.name : "Not assigned"}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline">{student.status || "Active"}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
            <CardDescription>Last 30 days attendance statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">Total</div>
                <div className="mt-1 text-2xl font-bold">{stats.total}</div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">Present</div>
                <div className="mt-1 text-2xl font-bold">{stats.present}</div>
                <div className="text-xs text-muted-foreground">
                  {stats.total > 0 ? `${Math.round((stats.present / stats.total) * 100)}%` : "0%"}
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">Absent</div>
                <div className="mt-1 text-2xl font-bold">{stats.absent}</div>
                <div className="text-xs text-muted-foreground">
                  {stats.total > 0 ? `${Math.round((stats.absent / stats.total) * 100)}%` : "0%"}
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">Late</div>
                <div className="mt-1 text-2xl font-bold">{stats.late}</div>
                <div className="text-xs text-muted-foreground">
                  {stats.total > 0 ? `${Math.round((stats.late / stats.total) * 100)}%` : "0%"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>Showing attendance records for the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list">
            {/* <TabsList className="mb-4">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="calendar">
                <Calendar className="mr-2 h-4 w-4" />
                Calendar View
              </TabsTrigger>
            </TabsList> */}

            <TabsContent value="list">
              <AttendanceTable records={records} />
            </TabsContent>

            <TabsContent value="calendar">
              <div className="rounded-md border p-4">
                <div className="grid grid-cols-7 gap-2 text-center">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="font-medium text-sm py-1">
                      {day}
                    </div>
                  ))}

                  {/* This is a placeholder for the calendar view */}
                  {Array.from({ length: 35 }).map((_, i) => {
                    const date = new Date()
                    date.setDate(date.getDate() - 30 + i)

                    // Find attendance for this date
                    const dateStr = format(date, "yyyy-MM-dd")
                    const dayAttendance = records.find((r) => format(new Date(r.date), "yyyy-MM-dd") === dateStr)

                    let statusClass = "bg-gray-100"
                    if (dayAttendance) {
                      switch (dayAttendance.status) {
                        case "present":
                          statusClass = "bg-green-100 text-green-800"
                          break
                        case "absent":
                          statusClass = "bg-red-100 text-red-800"
                          break
                        case "late":
                          statusClass = "bg-amber-100 text-amber-800"
                          break
                        case "excused":
                          statusClass = "bg-blue-100 text-blue-800"
                          break
                      }
                    }

                    return (
                      <div key={i} className={`rounded-md p-2 h-20 flex flex-col ${statusClass}`}>
                        <span className="text-sm font-medium">{format(date, "d")}</span>
                        {dayAttendance && (
                          <div className="mt-1 text-xs">
                            {dayAttendance.status.charAt(0).toUpperCase() + dayAttendance.status.slice(1)}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
