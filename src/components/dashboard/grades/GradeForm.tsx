"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { createOrUpdateGrade, getGradeFormData, getStudentsByClass } from "@/lib/action/grade.actions"

// Define the form schema
const gradeFormSchema = z.object({
  gradeId: z.string().optional(),
  studentId: z.string().min(1, "Student is required"),
  courseId: z.string().min(1, "Course is required"),
  classId: z.string().min(1, "Class is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  term: z.string().min(1, "Term is required"),
  examType: z.string().min(1, "Exam type is required"),
  score: z.coerce.number().min(0, "Score must be at least 0"),
  maxScore: z.coerce.number().min(1, "Maximum score must be at least 1"),
  remarks: z.string().optional(),
})

interface GradeFormProps {
  initialData?: any
  studentId?: string
  classId?: string
  courseId?: string
}

export default function GradeForm({ initialData, studentId, classId, courseId }: GradeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formDataLoading, setFormDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>({
    classes: [],
    courses: [],
    examTypes: [],
    terms: [],
    currentAcademicYear: "",
  })
  const [students, setStudents] = useState<any[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>(classId || "")

  // Initialize form
  const form = useForm<z.infer<typeof gradeFormSchema>>({
    resolver: zodResolver(gradeFormSchema),
    defaultValues: {
      gradeId: initialData?._id || "",
      studentId: studentId || initialData?.student?._id || "",
      courseId: courseId || initialData?.course?._id || "",
      classId: classId || initialData?.class?._id || "",
      academicYear: initialData?.academicYear || "",
      term: initialData?.term || "",
      examType: initialData?.examType || "",
      score: initialData?.score || 0,
      maxScore: initialData?.maxScore || 100,
      remarks: initialData?.remarks || "",
    },
  })

  // Load form data
  useEffect(() => {
    const loadFormData = async () => {
      setFormDataLoading(true)
      try {
        const result = await getGradeFormData()
        if (result.success) {
          setFormData(result.data)

          // Set default values if not provided in initialData
          if (!initialData?.academicYear) {
            form.setValue("academicYear", result.data.currentAcademicYear)
          }
          if (!initialData?.term && result.data.terms.length > 0) {
            form.setValue("term", result.data.terms[0])
          }
          if (!initialData?.examType && result.data.examTypes.length > 0) {
            form.setValue("examType", result.data.examTypes[0])
          }
          if (!initialData?.maxScore) {
            form.setValue("maxScore", 100)
          }
        } else {
          setError(result.message)
        }
      } catch (err) {
        setError("Failed to load form data")
        console.error(err)
      } finally {
        setFormDataLoading(false)
      }
    }

    loadFormData()
  }, [form, initialData])

  // Load students when class changes
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedClassId) {
        setStudents([])
        return
      }

      try {
        const result = await getStudentsByClass(selectedClassId)
        if (result.success) {
          setStudents(result.data)
        } else {
          console.error("Failed to load students:", result.message)
        }
      } catch (err) {
        console.error("Error loading students:", err)
      }
    }

    loadStudents()
  }, [selectedClassId])

  // Handle class change
  const handleClassChange = (value: string) => {
    setSelectedClassId(value)
    form.setValue("classId", value)

    // Clear student selection if class changes
    if (!initialData && value !== classId) {
      form.setValue("studentId", "")
    }
  }

  // Handle form submission
  async function onSubmit(values: z.infer<typeof gradeFormSchema>) {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()

      // Append all form values
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })

      const result = await createOrUpdateGrade(formData)

      if (result.success) {
        setSuccess("Grade saved successfully")

        // Redirect after a short delay if not editing
        if (!initialData) {
          setTimeout(() => {
            if (studentId) {
              router.push(`/dashboard/grades/student/${studentId}`)
            } else if (classId) {
              router.push(`/dashboard/grades/class/${classId}`)
            } else {
              router.push("/dashboard/grades")
            }
            router.refresh()
          }, 1500)
        }
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("An error occurred while saving the grade")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (formDataLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Grade" : "Record New Grade"}</CardTitle>
        <CardDescription>
          {initialData ? "Update the grade details below" : "Enter the grade details for the student"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Class Selection */}
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select
                      disabled={loading || !!classId}
                      onValueChange={(value) => handleClassChange(value)}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {formData.classes.map((cls: any) => (
                          <SelectItem key={cls._id} value={cls._id}>
                            {cls.name} ({cls.academicYear})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Select the class for this grade entry</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Student Selection */}
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student</FormLabel>
                    <Select
                      disabled={loading || !selectedClassId || !!studentId}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {students.map((student: any) => (
                          <SelectItem key={student._id} value={student._id}>
                            {student.firstName} {student.lastName} ({student.registrationNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Select the student to grade</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Course Selection */}
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select
                      disabled={loading || !!courseId}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {formData.courses.map((course: any) => (
                          <SelectItem key={course._id} value={course._id}>
                            {course.name} ({course.courseCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Select the course for this grade</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Academic Year */}
              <FormField
                control={form.control}
                name="academicYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Year</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={loading} />
                    </FormControl>
                    <FormDescription>Format: YYYY-YYYY (e.g., 2023-2024)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Term */}
              <FormField
                control={form.control}
                name="term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term</FormLabel>
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a term" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {formData.terms.map((term: string) => (
                          <SelectItem key={term} value={term}>
                            {term}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Exam Type */}
              <FormField
                control={form.control}
                name="examType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam Type</FormLabel>
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select exam type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {formData.examTypes.map((type: string) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Score */}
              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Score</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={loading} />
                    </FormControl>
                    <FormDescription>The marks obtained by the student</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Max Score */}
              <FormField
                control={form.control}
                name="maxScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Score</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={loading} />
                    </FormControl>
                    <FormDescription>The maximum possible marks for this assessment</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Remarks */}
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any comments or feedback about the student's performance"
                      className="resize-none"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()} className="mr-2" disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Update Grade" : "Save Grade"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
