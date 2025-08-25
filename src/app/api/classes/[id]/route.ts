import { type NextRequest, NextResponse } from "next/server"
import { getClassById, updateClass, deleteClass } from "@/lib/action/class.actions"

interface Params {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const classData = await getClassById(params.id)
    return NextResponse.json(classData)
  } catch (error: any) {
    console.error("Error fetching class:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch class" },
      { status: error.message.includes("not found") ? 404 : 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const formData = await request.formData()
    await updateClass(params.id, formData)

    // Note: updateClass might redirect, which throws NEXT_REDIRECT
    // If successful without redirect, return success
    return NextResponse.json({ success: true }) 
  } catch (error: any) {
    // Check if it's a redirect error and re-throw if so
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    
    // Handle other errors
    console.error("Error updating class:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update class" },
      { status: error.message.includes("not found") ? 404 : 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await deleteClass(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting class:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete class" },
      { status: error.message.includes("not found") ? 404 : 500 },
    )
  }
}
