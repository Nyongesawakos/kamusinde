"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createExam, updateExam, getExamFormData, getExamById } from "@/lib/action/exam.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Calendar, Clock } from "lucide-react"
import { format } from "date-fns"

interface ExamFormProps {
  examId?: string
}

export default function ExamForm({ examId }: ExamFormProps) {
  const router = useRouter()
  const isEditing = !!examId

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    examType: "midterm",
    courseId: "",
    classId: "",
    totalMarks: 100,
    passingMarks: 40,
    duration: 60,
    examDate: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "10:00",
    instructions: "",
    status: "scheduled",
  })

  useEffect(() => {
    async function fetchFormData() {
      setLoading(true)
      try {
         const response = await getExamFormData()
         if (response.success) {
            // Provide fallback empty array if courses/classes are undefined
            setCourses(response.courses || [])
            setClasses(response.classes || [])
          } else {
            toast.error("Error loading form data", {
             description: response.error || "Failed to load necessary courses and classes.",
           })
         }
       } catch (error) {
         console.error("Error fetching form data:", error)
         toast.error("Network Error", {
           description: "Could not fetch form data. Please check your connection.",
         })
       } finally {
        setLoading(false)
      }
    }

    async function fetchExamData() {
      setLoading(true)
      try {
         const response = await getExamById(examId!)
         // Ensure exam data exists before setting form data
         if (response.success && response.exam) {
           const exam = response.exam as any // Use 'as any' for simplicity, consider defining a proper type
           setFormData({
             title: exam.title || "", // Add fallbacks for safety
             description: exam.description || "",
             examType: exam.examType || "midterm",
             courseId: exam.courseId?._id || "", // Handle potential missing nested _id
             classId: exam.classId?._id || "", // Handle potential missing nested _id
             totalMarks: exam.totalMarks || 100,
             passingMarks: exam.passingMarks || 40,
             duration: exam.duration || 60,
             examDate: exam.examDate ? format(new Date(exam.examDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
             startTime: exam.startTime || "09:00",
             endTime: exam.endTime || "10:00",
             instructions: exam.instructions || "",
             status: exam.status || "scheduled",
            })
          } else {
            toast.error("Error loading exam data", {
             description: response.error || "Failed to load the requested exam details.",
           })
         }
       } catch (error) {
         console.error("Error fetching exam data:", error)
         toast.error("Network Error", {
           description: "Could not fetch exam data. Please check your connection.",
         })
       } finally {
        setLoading(false)
      }
    }

    fetchFormData()
    if (isEditing) {
      fetchExamData()
    }
  }, [examId, isEditing])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value.toString())
      })

      let response
      if (isEditing) {
        response = await updateExam(examId!, formDataObj)
      } else {
        response = await createExam(formDataObj)
       }

       if (response.success) {
         toast.success("Success", {
           description: isEditing ? "Exam updated successfully" : "Exam created successfully",
         })

         if (isEditing) {
          router.push(`/dashboard/exams/${examId}`)
        } else {
          router.push("/dashboard/exams")
         }
       } else {
         toast.error("Error saving exam", {
           description: response.error || "Failed to save the exam details.",
         })
       }
     } catch (error) {
       console.error("Error submitting form:", error)
       toast.error("Submission Error", {
         description: "An unexpected error occurred while submitting the form.",
       })
     } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Exam" : "Create New Exam"}</CardTitle>
        <CardDescription>
          {isEditing ? "Update the exam details below" : "Fill in the details to create a new exam"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Exam Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="End of Term Mathematics Exam"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="examType">Exam Type *</Label>
              <Select value={formData.examType} onValueChange={(value) => handleSelectChange("examType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="midterm">Midterm</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                  <SelectItem value="practical">Practical</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseId">Course *</Label>
              <Select value={formData.courseId} onValueChange={(value) => handleSelectChange("courseId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.name} ({course.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="classId">Class (Optional)</Label>
              <Select value={formData.classId} onValueChange={(value) => handleSelectChange("classId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific class</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls._id} value={cls._id}>
                      {cls.name} ({cls.academicYear})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalMarks">Total Marks *</Label>
              <Input
                id="totalMarks"
                name="totalMarks"
                type="number"
                value={formData.totalMarks}
                onChange={handleChange}
                min={1}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passingMarks">Passing Marks *</Label>
              <Input
                id="passingMarks"
                name="passingMarks"
                type="number"
                value={formData.passingMarks}
                onChange={handleChange}
                min={0}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                min={1}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="examDate">Exam Date *</Label>
              <div className="relative">
                <Input
                  id="examDate"
                  name="examDate"
                  type="date"
                  value={formData.examDate}
                  onChange={handleChange}
                  required
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <div className="relative">
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
                <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <div className="relative">
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
                <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the exam"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="Instructions for students taking the exam"
              rows={5}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/exams")} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{isEditing ? "Update Exam" : "Create Exam"}</>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
