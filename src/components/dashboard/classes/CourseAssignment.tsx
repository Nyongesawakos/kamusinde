"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronsUpDown, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Course {
  _id: string
  name: string
  code: string
  description?: string
}

interface CourseAssignmentProps {
  classId: string
  availableCourses: Course[]
  assignedCourses: Course[]
}

export default function CourseAssignment({ classId, availableCourses, assignedCourses }: CourseAssignmentProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourses, setSelectedCourses] = useState<Course[]>(assignedCourses || [])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter available courses based on search term, safely handling potentially missing properties
  const filteredCourses = availableCourses.filter((course) => {
    const name = (course.name ?? '').toLowerCase() // Use ?? '' for safety
    const code = (course.code ?? '').toLowerCase() // Use ?? '' for safety
    const search = searchTerm.toLowerCase()

    // Ensure course has a name or code before attempting to include
    return (name && name.includes(search)) || (code && code.includes(search))
  })

  // Handle course selection
  const toggleCourse = (course: Course) => {
    const isSelected = selectedCourses.some((c) => c._id === course._id)

    if (isSelected) {
      setSelectedCourses(selectedCourses.filter((c) => c._id !== course._id))
    } else {
      setSelectedCourses([...selectedCourses, course])
    }
  }

  // Remove a course from selection
  const removeCourse = (courseId: string) => {
    setSelectedCourses(selectedCourses.filter((c) => c._id !== courseId))
  }

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/classes/${classId}/courses`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseIds: selectedCourses.map((c) => c._id),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to assign courses")
      }

      toast.success("Courses assigned", {
        description: "Courses have been assigned to the class successfully.",
      })

      router.refresh()
    } catch (error: any) {
      console.error("Error assigning courses:", error)
      toast.error("Error", {
        description: error.message || "Failed to assign courses",
        // Note: 'variant' is not a standard option here, styling is usually implicit
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Courses</CardTitle>
        <CardDescription>
          Assign courses to this class. Students in this class will study these courses.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={open} className="justify-between">
                Select courses to assign
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-0 w-[400px]"
              align="start"
              side="bottom"
              sideOffset={8}
              alignOffset={0}
            
            >
              <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Input
                  placeholder="Search courses..."
                  className="flex h-10 w-full rounded-md border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Command>
                <CommandInput placeholder="Search courses..." className="hidden" />
                <CommandList>
                  <CommandEmpty>No courses found.</CommandEmpty>
                  <CommandGroup>
                    <ScrollArea className="h-[200px]">
                      {filteredCourses.map((course) => {
                        const isSelected = selectedCourses.some((c) => c._id === course._id)
                        return (
                          <CommandItem
                            key={course._id}
                            onSelect={() => toggleCourse(course)}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <span>{course.name}</span>
                              <span className="ml-2 text-xs text-muted-foreground">({course.code})</span>
                            </div>
                            <Check className={cn("h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                          </CommandItem>
                        )
                      })}
                    </ScrollArea>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <div className="flex flex-wrap gap-2 mt-2">
            {selectedCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No courses selected</p>
            ) : (
              selectedCourses.map((course) => (
                <Badge key={course._id} variant="secondary" className="flex items-center gap-1">
                  {course.name} ({course.code})
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => removeCourse(course._id)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </Badge>
              ))
            )}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Selected Courses ({selectedCourses.length})</h3>
          <ScrollArea className="h-[200px] border rounded-md p-2">
            {selectedCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground p-2">No courses selected</p>
            ) : (
              <div className="space-y-2">
                {selectedCourses.map((course) => (
                  <div key={course._id} className="flex items-center justify-between rounded-md border p-2">
                    <div>
                      <p className="text-sm font-medium">{course.name}</p>
                      <p className="text-xs text-muted-foreground">{course.code}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeCourse(course._id)}>
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setSelectedCourses(assignedCourses || [])} disabled={isSubmitting}>
          Reset
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  )
}
