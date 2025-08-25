"use client";

import { useState, Suspense } from "react";
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
import { Loader2, Plus, X } from "lucide-react";
import { createTeacher, updateTeacher } from "@/lib/action/teacher.actions";
import { Badge } from "@/components/ui/badge";

// Validation schema
const teacherSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" }),
  staffId: z.string().min(2, { message: "Staff ID is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  address: z.string().optional(),
  contactNumber: z.string().optional(),
  qualification: z.string().optional(),
  specialization: z.array(z.string()).default([]),
  joiningDate: z.string().optional(),
  subjects: z.array(z.string()).default([]),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .optional(),
});

type TeacherFormValues = z.infer<typeof teacherSchema>;

interface TeacherFormProps {
  initialData?: any;
  isEditing?: boolean;
}

// Create a client component that uses router and form hooks
function TeacherFormContent({
  initialData,
  isEditing = false,
}: TeacherFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSpecialization, setNewSpecialization] = useState("");
  const [newSubject, setNewSubject] = useState("");

  // Initialize form with default values or existing data
  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: initialData
      ? {
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          staffId: initialData.staffId,
          email: initialData.user?.email || "",
          dateOfBirth: initialData.dateOfBirth
            ? new Date(initialData.dateOfBirth).toISOString().split("T")[0]
            : undefined,
          gender: initialData.gender,
          address: initialData.address,
          contactNumber: initialData.contactNumber,
          qualification: initialData.qualification,
          specialization: initialData.specialization || [],
          joiningDate: initialData.joiningDate
            ? new Date(initialData.joiningDate).toISOString().split("T")[0]
            : undefined,
          subjects: initialData.subjects || [],
        }
      : {
          firstName: "",
          lastName: "",
          staffId: "",
          email: "",
          dateOfBirth: "",
          gender: undefined,
          address: "",
          contactNumber: "",
          qualification: "",
          specialization: [],
          joiningDate: new Date().toISOString().split("T")[0],
          subjects: [],
          password: "",
        },
  });

  const onSubmit = async (data: TeacherFormValues) => {
    setIsSubmitting(true);

    try {
      if (isEditing && initialData) {
        // Update existing teacher
        const result = await updateTeacher(initialData._id, data);

        if (result.success) {
          toast.success(result.message);
          router.push("/dashboard/teachers");
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
        // Create new teacher
        const result = await createTeacher(data);

        if (result.success) {
          toast.success(result.message);
          router.push("/dashboard/teachers");
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

  const addSpecialization = () => {
    if (newSpecialization.trim() === "") return;

    const currentSpecializations = form.getValues("specialization") || [];
    if (!currentSpecializations.includes(newSpecialization)) {
      form.setValue("specialization", [
        ...currentSpecializations,
        newSpecialization,
      ]);
      setNewSpecialization("");
    }
  };

  const removeSpecialization = (item: string) => {
    const currentSpecializations = form.getValues("specialization") || [];
    form.setValue(
      "specialization",
      currentSpecializations.filter((s) => s !== item)
    );
  };

  const addSubject = () => {
    if (newSubject.trim() === "") return;

    const currentSubjects = form.getValues("subjects") || [];
    if (!currentSubjects.includes(newSubject)) {
      form.setValue("subjects", [...currentSubjects, newSubject]);
      setNewSubject("");
    }
  };

  const removeSubject = (item: string) => {
    const currentSubjects = form.getValues("subjects") || [];
    form.setValue(
      "subjects",
      currentSubjects.filter((s) => s !== item)
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Personal Information</h3>

            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John"
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
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Doe"
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
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter teacher's address"
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
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+254 700 000000"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Professional Information</h3>

            <FormField
              control={form.control}
              name="staffId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Staff ID *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="TCH/2023/001"
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
              name="qualification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualification</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Bachelor of Education"
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
              name="joiningDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Joining Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialization</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add specialization"
                      value={newSpecialization}
                      onChange={(e) => setNewSpecialization(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addSpecialization}
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
                          onClick={() => removeSpecialization(item)}
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
              name="subjects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subjects</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add subject"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addSubject}
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
                          onClick={() => removeSubject(item)}
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
          </div>
        </div>

        {/* Account Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Account Information</h3>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="teacher@example.com"
                    {...field}
                    disabled={
                      isSubmitting || (isEditing && initialData?.user?.email)
                    }
                  />
                </FormControl>
                <FormDescription>
                  This will be used for the teacher's login account.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isEditing && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave blank to use the default password (password123).
                  </FormDescription>
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
            onClick={() => router.push("/dashboard/teachers")}
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
            {isEditing ? "Update Teacher" : "Create Teacher"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Main component with Suspense
export default function TeacherForm({
  initialData,
  isEditing = false,
}: TeacherFormProps) {
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
      <TeacherFormContent initialData={initialData} isEditing={isEditing} />
    </Suspense>
  );
}
