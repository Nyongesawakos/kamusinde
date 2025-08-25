import { type NextRequest, NextResponse } from "next/server"
import { assignStudentsToClass, getStudentsInClass } from "@/lib/action/class.actions"

interface Params {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const students = await getStudentsInClass(params.id)
    return NextResponse.json(students)
  } catch (error: any) {
    console.error("Error fetching students in class:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch students" },
      { status: error.message.includes("not found") ? 404 : 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    const { studentIds } = body

    if (!Array.isArray(studentIds)) {
      return NextResponse.json({ error: "studentIds must be an array" }, { status: 400 })
    }

    await assignStudentsToClass(params.id, studentIds)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error assigning students to class:", error)
    return NextResponse.json(
      { error: error.message || "Failed to assign students" },
      { status: error.message.includes("not found") ? 404 : 500 },
    )
  }
}
