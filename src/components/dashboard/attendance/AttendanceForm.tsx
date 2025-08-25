"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon, Check, X, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
// import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { markAttendance } from "@/lib/action/attendance.actions"

const formSchema = z.object({
  date: z.date({
    required_error: "Attendance date is required",
  }),
  status: z.enum(["present", "absent", "late", "excused"], {
    required_error: "Please select an attendance status",
  }),
  remarks: z.string().optional(),
})

type AttendanceFormValues = z.infer<typeof formSchema>

interface AttendanceFormProps {
  studentId: string
  classId: string
  courseId?: string
  defaultValues?: Partial<AttendanceFormValues>
  onSuccess?: () => void
}

export default function AttendanceForm({
  studentId,
  classId,
  courseId,
  defaultValues,
  onSuccess,
}: AttendanceFormProps) {
  const router = useRouter()

  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: defaultValues?.date || new Date(),
      status: defaultValues?.status || "present",
      remarks: defaultValues?.remarks || "",
    },
  })

  async function onSubmit(values: AttendanceFormValues) {
    setIsSubmitting(true)

    try {
      const result = await markAttendance(
        studentId,
        classId,
        values.date.toISOString(),
        values.status,
        courseId,
        values.remarks,
      )

      if (result.success) {
        toast.success("Success",{

          description: result.message,
        })

        if (onSuccess) {
          onSuccess()
        } else {
          router.refresh()
        }
      } else {
        toast.error("Error",{
  
          description: result.message,
        })
      }
    } catch (error) {
      toast.error("Error",{
        description: "Failed to mark attendance. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
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
              <FormDescription>Select the date for this attendance record.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attendance Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select attendance status" />
                  </SelectTrigger>
                </FormControl>
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
              <FormDescription>Select the attendance status for this student.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remarks (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Add any additional notes or remarks" className="resize-none" {...field} />
              </FormControl>
              <FormDescription>Add any additional information about this attendance record.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Attendance"}
        </Button>
      </form>
    </Form>
  )
}
