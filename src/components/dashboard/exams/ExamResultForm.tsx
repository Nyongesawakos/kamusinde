"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { recordExamResult } from "@/lib/action/exam.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface ExamResultFormProps {
  examId: string
  studentId: string
  studentName: string
  totalMarks: number
  passingMarks: number
  existingResult?: any
  onSuccess?: () => void
}

export default function ExamResultForm({
  examId,
  studentId,
  studentName,
  totalMarks,
  passingMarks,
  existingResult,
  onSuccess,
}: ExamResultFormProps) {
  const router = useRouter()
  const isEditing = !!existingResult

  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    marksObtained: existingResult?.marksObtained || 0,
    status: existingResult?.status || "pass",
    feedback: existingResult?.feedback || "",
  })

  useEffect(() => {
    if (existingResult) {
      setFormData({
        marksObtained: existingResult.marksObtained,
        status: existingResult.status,
        feedback: existingResult.feedback || "",
      })
    }
  }, [existingResult])

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
      formDataObj.append("examId", examId)
      formDataObj.append("studentId", studentId)
      formDataObj.append("marksObtained", formData.marksObtained.toString())
      formDataObj.append("status", formData.status)
      formDataObj.append("feedback", formData.feedback)

       const response = await recordExamResult(formDataObj)

       if (response.success) {
         toast.success("Success", {
           description: isEditing ? "Result updated successfully" : "Result recorded successfully",
         })

         if (onSuccess) {
          onSuccess()
         }
       } else {
         toast.error("Error saving result", {
           description: response.error || "Failed to save the exam result.",
         })
       }
     } catch (error) {
       console.error("Error submitting form:", error)
       toast.error("Submission Error", {
         description: "An unexpected error occurred while saving the result.",
       })
     } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {isEditing ? "Edit Result" : "Record Result"} for {studentName}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="marksObtained">Marks Obtained (out of {totalMarks})</Label>
            <Input
              id="marksObtained"
              name="marksObtained"
              type="number"
              value={formData.marksObtained}
              onChange={handleChange}
              min={0}
              max={totalMarks}
              step="0.01"
              required
            />
            <p className="text-xs text-muted-foreground">Passing marks: {passingMarks}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pass">Pass</SelectItem>
                <SelectItem value="fail">Fail</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback (Optional)</Label>
            <Textarea
              id="feedback"
              name="feedback"
              value={formData.feedback}
              onChange={handleChange}
              placeholder="Provide feedback on the student's performance"
              rows={3}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => onSuccess?.()} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>{isEditing ? "Update Result" : "Save Result"}</>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
