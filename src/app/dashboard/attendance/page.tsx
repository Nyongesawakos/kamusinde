import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardCheck, BarChart2 } from "lucide-react"
import ClassAttendanceForm from "@/components/dashboard/attendance/ClassAttendanceForm"
import AttendanceStats from "@/components/dashboard/attendance/AttendanceStats"
import { connectToDatabase } from "@/lib/mongoose"
import ClassModel from "@/database/models/Class.model"
import CourseModel from "@/database/models/Course.model"

async function getClasses() {
  await connectToDatabase()

  const classesData = await ClassModel.find().sort({ name: 1 }).select("_id name").lean()

  // Explicitly serialize _id to string
  const classes = classesData.map((cls) => ({
    ...cls,
    _id: cls._id.toString(),
  }))

  return classes
}

async function getCourses() {
  await connectToDatabase()

  const coursesData = await CourseModel.find().sort({ name: 1 }).select("_id name courseCode").lean()

  // Explicitly serialize _id to string
  const courses = coursesData.map((course) => ({
    ...course,
    _id: course._id.toString(),
  }))

  return courses
}

export default async function AttendancePage() {
  const classes = await getClasses()
  const courses = await getCourses()

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Attendance Management</h2>
      </div>

      <Tabs defaultValue="mark" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mark">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Mark Attendance
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart2 className="mr-2 h-4 w-4" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mark" className="space-y-4">
          <Suspense fallback={<AttendanceLoadingState />}>
            <ClassAttendanceForm classes={classes} courses={courses} />
          </Suspense>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Suspense fallback={<AttendanceLoadingState />}>
            <AttendanceStats classes={classes} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AttendanceLoadingState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="h-6 w-1/3 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></CardTitle>
        <CardDescription className="h-4 w-1/2 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-10 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-10 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-10 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-40 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </CardContent>
    </Card>
  )
}
