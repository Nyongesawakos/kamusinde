import { type NextRequest, NextResponse } from "next/server"
import { assignCoursesToClass } from "@/lib/action/class.actions"

interface Params {
  params: {
    id: string
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    const { courseIds } = body

    if (!Array.isArray(courseIds)) {
      return NextResponse.json({ error: "courseIds must be an array" }, { status: 400 })
    }

    await assignCoursesToClass(params.id, courseIds)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error assigning courses to class:", error)
    return NextResponse.json(
      { error: error.message || "Failed to assign courses" },
      { status: error.message.includes("not found") ? 404 : 500 },
    )
  }
}
