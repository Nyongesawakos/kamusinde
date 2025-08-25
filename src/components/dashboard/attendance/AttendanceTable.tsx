"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Check, X, Clock, AlertCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { deleteAttendanceRecord } from "@/lib/action/attendance.actions"
import AttendanceForm from "./AttendanceForm"

interface AttendanceRecord {
  _id: string
  student: {
    _id: string
    firstName: string
    lastName: string
    admissionNumber: string
  }
  class: {
    _id: string
    name: string
  }
  course?: {
    _id: string
    name: string
    courseCode: string
  }
  date: string
  status: "present" | "absent" | "late" | "excused"
  remarks?: string
  markedBy: {
    _id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

interface AttendanceTableProps {
  records: AttendanceRecord[]
  onRefresh?: () => void
}

export default function AttendanceTable({ records, onRefresh }: AttendanceTableProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <Check className="mr-1 h-3 w-3" />
            Present
          </Badge>
        )
      case "absent":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <X className="mr-1 h-3 w-3" />
            Absent
          </Badge>
        )
      case "late":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <Clock className="mr-1 h-3 w-3" />
            Late
          </Badge>
        )
      case "excused":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <AlertCircle className="mr-1 h-3 w-3" />
            Excused
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      const result = await deleteAttendanceRecord(id)
      if (result.success) {
        toast.success("Success", {
          description: "Attendance record deleted successfully",
        })
        setShowDeleteDialog(false)
        if (onRefresh) {
          onRefresh()
        }
      } else {
        toast.error("Error", {

          description: result.message,
        })
      }
    } catch (error) {
      toast.error("Error",{
        description: "Failed to delete attendance record",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditSuccess = () => {
    setShowEditDialog(false)
    if (onRefresh) {
      onRefresh()
    }
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
          <AlertCircle className="h-6 w-6 text-gray-500" />
        </div>
        <h3 className="mt-4 text-lg font-medium">No attendance records</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">There are no attendance records to display.</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record._id}>
                <TableCell className="font-medium">
                  {record.student.firstName} {record.student.lastName}
                  <div className="text-xs text-gray-500">{record.student.admissionNumber}</div>
                </TableCell>
                <TableCell>{format(new Date(record.date), "PPP")}</TableCell>
                <TableCell>{getStatusBadge(record.status)}</TableCell>
                <TableCell>{record.class.name}</TableCell>
                <TableCell>
                  {record.course ? (
                    <>
                      {record.course.name}
                      <div className="text-xs text-gray-500">{record.course.courseCode}</div>
                    </>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </TableCell>
                <TableCell>{record.remarks || <span className="text-gray-500">No remarks</span>}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedRecord(record)
                          setShowEditDialog(true)
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          setSelectedRecord(record)
                          setShowDeleteDialog(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
            <DialogDescription>Update the attendance record for this student.</DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <AttendanceForm
              studentId={selectedRecord.student._id}
              classId={selectedRecord.class._id}
              courseId={selectedRecord.course?._id}
              defaultValues={{
                date: new Date(selectedRecord.date),
                status: selectedRecord.status,
                remarks: selectedRecord.remarks,
              }}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this attendance record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedRecord && handleDelete(selectedRecord._id)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
