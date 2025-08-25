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

interface Student {
  _id: string
  firstName: string
  lastName: string
  admissionNumber: string
}

interface StudentAssignmentProps {
  classId: string
  availableStudents: Student[]
  assignedStudents: Student[]
}

export default function StudentAssignment({ classId, availableStudents, assignedStudents }: StudentAssignmentProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudents, setSelectedStudents] = useState<Student[]>(assignedStudents || [])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter available students based on search term
  const filteredStudents = availableStudents.filter((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase()
    const admissionNumber = student.admissionNumber.toLowerCase()
    const search = searchTerm.toLowerCase()

    return fullName.includes(search) || admissionNumber.includes(search)
  })

  // Handle student selection
  const toggleStudent = (student: Student) => {
    const isSelected = selectedStudents.some((s) => s._id === student._id)

    if (isSelected) {
      setSelectedStudents(selectedStudents.filter((s) => s._id !== student._id))
    } else {
      setSelectedStudents([...selectedStudents, student])
    }
  }

  // Remove a student from selection
  const removeStudent = (studentId: string) => {
    setSelectedStudents(selectedStudents.filter((s) => s._id !== studentId))
  }

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/classes/${classId}/students`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentIds: selectedStudents.map((s) => s._id),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to assign students")
      }

      toast.success("Students assigned", {
        description: "Students have been assigned to the class successfully.",
      })

      router.refresh()
    } catch (error: any) {
      console.error("Error assigning students:", error)
      toast.error("Error", {
        description: error.message || "Failed to assign students",
        // Note: 'variant' is not a standard option here, styling is usually implicit
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Students</CardTitle>
        <CardDescription>
          Assign students to this class. Students can only be assigned to one class at a time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={open} className="justify-between">
                Select students to assign
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
                  placeholder="Search students..."
                  className="flex h-10 w-full rounded-md border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Command>
                <CommandInput placeholder="Search students..." className="hidden" />
                <CommandList>
                  <CommandEmpty>No students found.</CommandEmpty>
                  <CommandGroup>
                    <ScrollArea className="h-[200px]">
                      {filteredStudents.map((student) => {
                        const isSelected = selectedStudents.some((s) => s._id === student._id)
                        return (
                          <CommandItem
                            key={student._id}
                            onSelect={() => toggleStudent(student)}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <span>
                                {student.firstName} {student.lastName}
                              </span>
                              <span className="ml-2 text-xs text-muted-foreground">({student.admissionNumber})</span>
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
            {selectedStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students selected</p>
            ) : (
              selectedStudents.map((student) => (
                <Badge key={student._id} variant="secondary" className="flex items-center gap-1">
                  {student.firstName} {student.lastName}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => removeStudent(student._id)}
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
          <h3 className="text-sm font-medium mb-2">Selected Students ({selectedStudents.length})</h3>
          <ScrollArea className="h-[200px] border rounded-md p-2">
            {selectedStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground p-2">No students selected</p>
            ) : (
              <div className="space-y-2">
                {selectedStudents.map((student) => (
                  <div key={student._id} className="flex items-center justify-between rounded-md border p-2">
                    <div>
                      <p className="text-sm font-medium">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{student.admissionNumber}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeStudent(student._id)}>
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
        <Button variant="outline" onClick={() => setSelectedStudents(assignedStudents || [])} disabled={isSubmitting}>
          Reset
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  )
}
