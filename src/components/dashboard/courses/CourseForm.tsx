"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, X } from "lucide-react";
import { createCourse, updateCourse } from "@/lib/action/course.actions";
import { Badge } from "@/components/ui/badge";
import { getAllTeachers } from "@/lib/action/teacher.actions";
import { Skeleton } from "@/components/ui/skeleton";

// Validation schema
const courseSchema = z.object({
  courseCode: z.string().min(2, { message: "Course code is required" }),
  name: z.string().min(2, { message: "Course name is required" }),
  description: z.string().optional(),
  credits: z.coerce
    .number()
    .min(0, { message: "Credits must be a positive number" }),
  duration: z.string().optional(),
  level: z.string().optional(),
  department: z.string().optional(),
  isActive: z.boolean().default(true),
  syllabus: z.string().optional(),
  prerequisites: z.array(z.string()).default([]),
  teachers: z.array(z.string()).default([]),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface CourseFormProps {
  initialData?: any;
  isEditing?: boolean;
}

// Create a client component that uses router and form hooks
function CourseFormContent({
  initialData,
  isEditing = false,
}: CourseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPrerequisite, setNewPrerequisite] = useState("");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);

  // Initialize form with default values or existing data
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: initialData
      ? {
          courseCode: initialData.courseCode,
          name: initialData.name,
          description: initialData.description || "",
          credits: initialData.credits,
          duration: initialData.duration || "",
          level: initialData.level || "",
          department: initialData.department || "",
          isActive: initialData.isActive,
          syllabus: initialData.syllabus || "",
          prerequisites: initialData.prerequisites || [],
          teachers: initialData.teachers?.map((t: any) => t._id || t) || [],
        }
      : {
          courseCode: "",
          name: "",
          description: "",
          credits: 0,
          duration: "",
          level: "",
          department: "",
          isActive: true,
          syllabus: "",
          prerequisites: [],
          teachers: [],
        },
  });

  // Fetch teachers for assignment
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const result = await getAllTeachers(1, 100);
        if (result.success) {
          setTeachers(result.data.teachers || []);
        } else {
          toast.error("Failed to load teachers");
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
        toast.error("An error occurred while loading teachers");
      } finally {
        setIsLoadingTeachers(false);
      }
    };

    fetchTeachers();
  }, []);

  const onSubmit = async (data: CourseFormValues) => {
    setIsSubmitting(true);

    try {
      if (isEditing && initialData) {
        // Update existing course
        const result = await updateCourse(initialData._id, data);

        if (result.success) {
          toast.success(result.message);
          router.push("/dashboard/courses");
          router.refresh();
        } else {
          toast.error(result.message);
          // Set form errors if available
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, messages]) => {
              if (messages && messages.length > 0) {
                form.setError(field as any, {
                  type: "server",
                  message: messages[0],
                });
              }
            });
          }
        }
      } else {
        // Create new course
        const result = await createCourse(data);

        if (result.success) {
          toast.success(result.message);
          router.push("/dashboard/courses");
          router.refresh();
        } else {
          toast.error(result.message);
          // Set form errors if available
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, messages]) => {
              if (messages && messages.length > 0) {
                form.setError(field as any, {
                  type: "server",
                  message: messages[0],
                });
              }
            });
          }
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim() === "") return;

    const currentPrerequisites = form.getValues("prerequisites") || [];
    if (!currentPrerequisites.includes(newPrerequisite)) {
      form.setValue("prerequisites", [
        ...currentPrerequisites,
        newPrerequisite,
      ]);
      setNewPrerequisite("");
    }
  };

  const removePrerequisite = (item: string) => {
    const currentPrerequisites = form.getValues("prerequisites") || [];
    form.setValue(
      "prerequisites",
      currentPrerequisites.filter((p) => p !== item)
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Course Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <FormField
              control={form.control}
              name="courseCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Code *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="MATH101"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    A unique identifier for the course
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Introduction to Mathematics"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter course description"
                      className="min-h-[100px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="credits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credits *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active Course</FormLabel>
                    <FormDescription>
                      This course is currently being offered
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Additional Course Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Information</h3>

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Mathematics Department"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1 term"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    E.g., "1 term", "2 semesters", etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prerequisites"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prerequisites</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add prerequisite"
                      value={newPrerequisite}
                      onChange={(e) => setNewPrerequisite(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addPrerequisite}
                      disabled={isSubmitting}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value?.map((item, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {item}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => removePrerequisite(item)}
                          disabled={isSubmitting}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="syllabus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Syllabus</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter course syllabus or outline"
                      className="min-h-[100px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Teacher Assignment */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Assign Teachers</h3>

          {isLoadingTeachers ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <FormField
              control={form.control}
              name="teachers"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Assigned Teachers</FormLabel>
                    <FormDescription>
                      Select teachers who will be teaching this course
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teachers.length > 0 ? (
                      teachers.map((teacher) => (
                        <div
                          key={teacher._id}
                          className="flex items-start space-x-2"
                        >
                          <Checkbox
                            id={`teacher-${teacher._id}`}
                            checked={field.value?.includes(teacher._id)}
                            onCheckedChange={(checked) => {
                              const currentTeachers = field.value || [];
                              if (checked) {
                                field.onChange([
                                  ...currentTeachers,
                                  teacher._id,
                                ]);
                              } else {
                                field.onChange(
                                  currentTeachers.filter(
                                    (id) => id !== teacher._id
                                  )
                                );
                              }
                            }}
                            disabled={isSubmitting}
                          />
                          <label
                            htmlFor={`teacher-${teacher._id}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            <div className="font-medium">
                              {teacher.firstName} {teacher.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Staff ID: {teacher.staffId}
                            </div>
                          </label>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-sm text-muted-foreground">
                        No teachers available. Please add teachers first.
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/courses")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#295E4F] hover:bg-[#1f4a3f]"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Course" : "Create Course"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Main component with Suspense
export default function CourseForm({
  initialData,
  isEditing = false,
}: CourseFormProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <CourseFormContent initialData={initialData} isEditing={isEditing} />
    </Suspense>
  );
}
