"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Trash2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

// Define the form schema
const classFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  academicYear: z.string().min(4, "Academic year is required"),
  form: z.string().min(1, "Form/Grade is required"),
  stream: z.string().optional(),
  classTeacher: z.string().optional(),
  capacity: z.number().int().nonnegative().optional(),
  isActive: z.boolean(), // Ensure isActive is always a boolean in the schema type
  schedule: z
    .array(
      z.object({
        day: z.string().min(1, "Day is required"),
        startTime: z.string().min(1, "Start time is required"),
        endTime: z.string().min(1, "End time is required"),
        room: z.string().optional(),
      }),
    )
    .optional(),
})

type ClassFormValues = z.infer<typeof classFormSchema>

type Teacher = {
  _id: string
  firstName: string
  lastName: string
  email: string
}

interface ClassFormProps {
  initialData?: any
  teachers: Teacher[]
}

export default function ClassForm({ initialData, teachers }: ClassFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scheduleItems, setScheduleItems] = useState<any[]>(
    initialData?.schedule?.length ? initialData.schedule : [{ day: "", startTime: "", endTime: "", room: "" }],
  )

  // Current year and next 5 years for academic year options
  const currentYear = new Date().getFullYear()
  const academicYears = Array.from({ length: 6 }, (_, i) => `${currentYear + i}-${currentYear + i + 1}`)

  // Form/Grade levels
  const formLevels = ["Form 1", "Form 2", "Form 3", "Form 4"]

  // Days of the week
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  // Initialize form with default values or existing data
  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          capacity: initialData.capacity || 0,
          classTeacher: initialData.classTeacher?._id || initialData.classTeacher || "",
          isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        }
      : {
          name: "",
          academicYear: `${currentYear}-${currentYear + 1}`,
          form: "",
          stream: "",
          classTeacher: "",
          capacity: 0,
          isActive: true,
          schedule: [],
        },
  })

  // Add a schedule item
  const addScheduleItem = () => {
    setScheduleItems([...scheduleItems, { day: "", startTime: "", endTime: "", room: "" }])
  }

  // Remove a schedule item
  const removeScheduleItem = (index: number) => {
    const newScheduleItems = [...scheduleItems]
    newScheduleItems.splice(index, 1)
    setScheduleItems(newScheduleItems)
  }

  // Update a schedule item
  const updateScheduleItem = (index: number, field: string, value: string) => {
    const newScheduleItems = [...scheduleItems]
    newScheduleItems[index] = { ...newScheduleItems[index], [field]: value }
    setScheduleItems(newScheduleItems)
  }

  // Handle form submission
  const onSubmit = async (data: ClassFormValues) => {
    try {
      setIsSubmitting(true)

      // Create FormData object
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("academicYear", data.academicYear)
      formData.append("form", data.form)
      formData.append("stream", data.stream || "")
      formData.append("classTeacher", data.classTeacher || "")
      formData.append("capacity", String(data.capacity || 0))
      formData.append("isActive", String(data.isActive))

      // Add schedule items
      formData.append("scheduleCount", String(scheduleItems.length))
      scheduleItems.forEach((item, index) => {
        formData.append(`schedule[${index}].day`, item.day)
        formData.append(`schedule[${index}].startTime`, item.startTime)
        formData.append(`schedule[${index}].endTime`, item.endTime)
        formData.append(`schedule[${index}].room`, item.room || "")
      })

      // Submit form
      if (initialData) {
        // Update existing class
        const response = await fetch(`/api/classes/${initialData._id}`, {
          method: "PUT",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Failed to update class")
        }
      } else {
        // Create new class
        const response = await fetch("/api/classes", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Failed to create class")
        }
      }

      toast.success(initialData ? "Class updated" : "Class created", {
        description: initialData
          ? "The class has been updated successfully."
          : "The class has been created successfully.",
      })

      router.push("/dashboard/classes")
      router.refresh()
    } catch (error: any) {
      console.error("Error submitting form:", error)
      toast.error("Error", {
        description: error.message || "Something went wrong",
        // Note: 'variant' is not a standard option here, styling is usually implicit
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="schedule">Class Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Class Information</CardTitle>
                <CardDescription>Enter the basic information about the class.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Form 1A" {...field} />
                        </FormControl>
                        <FormDescription>The full name of the class</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="academicYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Academic Year</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select academic year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {academicYears.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>The academic year for this class</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="form"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Form/Grade</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select form/grade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {formLevels.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>The form or grade level</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stream"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stream (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., A, B, Blue, Red" {...field} />
                        </FormControl>
                        <FormDescription>The stream or section of the class</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="classTeacher"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class Teacher</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class teacher" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {teachers.map((teacher) => (
                              <SelectItem key={teacher._id} value={teacher._id}>
                                {teacher.firstName} {teacher.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>The teacher responsible for this class</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="e.g., 40"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Maximum number of students</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>Is this class currently active?</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Class Schedule</CardTitle>
                <CardDescription>Set up the weekly schedule for this class.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {scheduleItems.map((item, index) => (
                  <div key={index} className="space-y-4">
                    {index > 0 && <Separator />}
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Schedule Item {index + 1}</h4>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeScheduleItem(index)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`day-${index}`}>Day</Label>
                        <Select value={item.day} onValueChange={(value) => updateScheduleItem(index, "day", value)}>
                          <SelectTrigger id={`day-${index}`}>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent>
                            {daysOfWeek.map((day) => (
                              <SelectItem key={day} value={day}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`room-${index}`}>Room (Optional)</Label>
                        <Input
                          id={`room-${index}`}
                          placeholder="e.g., Room 101"
                          value={item.room}
                          onChange={(e) => updateScheduleItem(index, "room", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`startTime-${index}`}>Start Time</Label>
                        <Input
                          id={`startTime-${index}`}
                          type="time"
                          value={item.startTime}
                          onChange={(e) => updateScheduleItem(index, "startTime", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`endTime-${index}`}>End Time</Label>
                        <Input
                          id={`endTime-${index}`}
                          type="time"
                          value={item.endTime}
                          onChange={(e) => updateScheduleItem(index, "endTime", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" size="sm" onClick={addScheduleItem} className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Schedule Item
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/classes")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData ? "Update Class" : "Create Class"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
