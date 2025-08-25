"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon, Check, X, Clock, AlertCircle, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
// import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { getClassAttendance, markBulkAttendance } from "@/lib/action/attendance.actions"

const formSchema = z.object({
  classId: z.string({
    required_error: "Class is required",
  }),
  date: z.date({
    required_error: "Date is required",
  }),
  courseId: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface ClassAttendanceFormProps {
  classes: { _id: string; name: string }[]
  courses?: { _id: string; name: string; courseCode: string }[]
  defaultClassId?: string
  defaultDate?: Date
  defaultCourseId?: string
}

export default function ClassAttendanceForm({
  classes,
  courses = [],
  defaultClassId,
  defaultDate,
  defaultCourseId,
}: ClassAttendanceFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [classData, setClassData] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({})
  const [remarks, setRemarks] = useState<Record<string, string>>({})

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      classId: defaultClassId || "",
      date: defaultDate || new Date(),
      courseId: defaultCourseId || "",
    },
  })

  const watchClassId = form.watch("classId")
  const watchDate = form.watch("date")
  const watchCourseId = form.watch("courseId")

  // Fetch class attendance data when form values change
  useEffect(() => {
    const fetchClassAttendance = async () => {
      if (!watchClassId) return

      setIsLoading(true)
      setClassData(null)

      try {
        const result = await getClassAttendance(watchClassId, watchDate.toISOString(), watchCourseId)

        if (result.success) {
          setClassData(result.data)

          // Initialize attendance data from existing records
          const initialAttendance: Record<string, string> = {}
          const initialRemarks: Record<string, string> = {}

          result.data.students.forEach((student: any) => {
            if (student.hasAttendance) {
              initialAttendance[student.student._id] = student.status
              if (student.attendance[0].remarks) {
                initialRemarks[student.student._id] = student.attendance[0].remarks
              }
            }
          })

          setAttendanceData(initialAttendance)
          setRemarks(initialRemarks)
        } else {
          toast.error("Error",{
        
            description: result.message,
          })
        }
      } catch (error) {
        toast.error("Error",{
        
          description: "Failed to fetch class attendance data",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (watchClassId && watchDate) {
      fetchClassAttendance()
    }
  }, [watchClassId, watchDate, watchCourseId, toast])

  // Handle attendance status change
  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status,
    }))
  }

  // Handle remarks change
  const handleRemarksChange = (studentId: string, value: string) => {
    setRemarks((prev) => ({
      ...prev,
      [studentId]: value,
    }))
  }

  // Filter students based on search term
  const filteredStudents = classData?.students.filter((student: any) =>
    `${student.student.firstName} ${student.student.lastName} ${student.student.admissionNumber}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  )

  // Handle bulk attendance submission
  const handleSubmit = async () => {
    if (!classData) return

    setIsSaving(true)

    try {
      // Prepare attendance data for submission
      const attendancePayload = Object.entries(attendanceData).map(([studentId, status]) => ({
        studentId,
        status: status as "present" | "absent" | "late" | "excused",
        remarks: remarks[studentId],
      }))

      const result = await markBulkAttendance(
        watchClassId,
        watchDate.toISOString(),
        attendancePayload,
        watchCourseId || undefined,
      )

      if (result.success) {
        toast.success("Success",{
        
          description: "Attendance marked successfully",
        })

        // Refresh the data
        router.refresh()
      } else {
        toast.error("Error",{
 
          description: result.message,
        })
      }
    } catch (error) {
      toast.error("Error",{

        description: "Failed to save attendance",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Quick actions to mark all students
  const markAllAs = (status: "present" | "absent" | "late" | "excused") => {
    if (!classData) return

    const newAttendanceData: Record<string, string> = {}

    classData.students.forEach((student: any) => {
      newAttendanceData[student.student._id] = status
    })

    setAttendanceData(newAttendanceData)
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls._id} value={cls._id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    {/* <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent> */}
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {courses.length > 0 && (
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {courses.map((course) => (
                          <SelectItem key={course._id} value={course._id}>
                            {course.name} ({course.courseCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Optionally filter by course</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </form>
      </Form>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : classData ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Class Attendance</CardTitle>
              <CardDescription>
                {format(new Date(classData.date), "PPPP")} - {classData.classDetails.name}
                {watchCourseId && courses.find((c) => c._id === watchCourseId) && (
                  <span className="ml-2">- {courses.find((c) => c._id === watchCourseId)?.name}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Total Students</div>
                  <div className="mt-1 text-2xl font-bold">{classData.stats.total}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Marked</div>
                  <div className="mt-1 text-2xl font-bold">{classData.stats.marked}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Present</div>
                  <div className="mt-1 text-2xl font-bold">{classData.stats.present}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Absent</div>
                  <div className="mt-1 text-2xl font-bold">{classData.stats.absent}</div>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => markAllAs("present")}>
                  <Check className="mr-1 h-4 w-4 text-green-500" />
                  Mark All Present
                </Button>
                <Button size="sm" variant="outline" onClick={() => markAllAs("absent")}>
                  <X className="mr-1 h-4 w-4 text-red-500" />
                  Mark All Absent
                </Button>
                <Button size="sm" variant="outline" onClick={() => markAllAs("late")}>
                  <Clock className="mr-1 h-4 w-4 text-amber-500" />
                  Mark All Late
                </Button>
                <Button size="sm" variant="outline" onClick={() => markAllAs("excused")}>
                  <AlertCircle className="mr-1 h-4 w-4 text-blue-500" />
                  Mark All Excused
                </Button>
              </div>

              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search students..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <Tabs defaultValue="list" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="grid">Grid View</TabsTrigger>
                </TabsList>

                <TabsContent value="list">
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-4 py-2 text-left font-medium">Student</th>
                          <th className="px-4 py-2 text-left font-medium">Status</th>
                          <th className="px-4 py-2 text-left font-medium">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents && filteredStudents.length > 0 ? (
                          filteredStudents.map((student: any) => (
                            <tr key={student.student._id} className="border-b">
                              <td className="px-4 py-2">
                                <div className="font-medium">
                                  {student.student.firstName} {student.student.lastName}
                                </div>
                                <div className="text-xs text-gray-500">{student.student.admissionNumber}</div>
                              </td>
                              <td className="px-4 py-2">
                                <Select
                                  value={attendanceData[student.student._id] || ""}
                                  onValueChange={(value) => handleStatusChange(student.student._id, value)}
                                >
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="present">
                                      <div className="flex items-center">
                                        <Check className="mr-2 h-4 w-4 text-green-500" />
                                        <span>Present</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="absent">
                                      <div className="flex items-center">
                                        <X className="mr-2 h-4 w-4 text-red-500" />
                                        <span>Absent</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="late">
                                      <div className="flex items-center">
                                        <Clock className="mr-2 h-4 w-4 text-amber-500" />
                                        <span>Late</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="excused">
                                      <div className="flex items-center">
                                        <AlertCircle className="mr-2 h-4 w-4 text-blue-500" />
                                        <span>Excused</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-4 py-2">
                                <Input
                                  placeholder="Add remarks (optional)"
                                  value={remarks[student.student._id] || ""}
                                  onChange={(e) => handleRemarksChange(student.student._id, e.target.value)}
                                />
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                              {searchTerm ? "No students match your search" : "No students in this class"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="grid">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredStudents && filteredStudents.length > 0 ? (
                      filteredStudents.map((student: any) => (
                        <Card key={student.student._id}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                              {student.student.firstName} {student.student.lastName}
                            </CardTitle>
                            <CardDescription>{student.student.admissionNumber}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {/* Use standard label for Status */}
                            <div>
                              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1 block">
                                Status
                              </label>
                              <Select
                                value={attendanceData[student.student._id] || ""}
                                onValueChange={(value) => handleStatusChange(student.student._id, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="present">
                                    <div className="flex items-center">
                                      <Check className="mr-2 h-4 w-4 text-green-500" />
                                      <span>Present</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="absent">
                                    <div className="flex items-center">
                                      <X className="mr-2 h-4 w-4 text-red-500" />
                                      <span>Absent</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="late">
                                    <div className="flex items-center">
                                      <Clock className="mr-2 h-4 w-4 text-amber-500" />
                                      <span>Late</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="excused">
                                    <div className="flex items-center">
                                      <AlertCircle className="mr-2 h-4 w-4 text-blue-500" />
                                      <span>Excused</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {/* Use standard label for Remarks */}
                            <div>
                              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1 block">
                                Remarks
                              </label>
                              <Input
                                placeholder="Add remarks (optional)"
                                value={remarks[student.student._id] || ""}
                                onChange={(e) => handleRemarksChange(student.student._id, e.target.value)}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full py-8 text-center text-gray-500">
                        {searchTerm ? "No students match your search" : "No students in this class"}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.refresh()}>
                Reset
              </Button>
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Attendance"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Class Attendance</CardTitle>
            <CardDescription>Select a class and date to view and mark attendance</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
              <AlertCircle className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No data to display</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Please select a class and date to view and mark attendance.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
