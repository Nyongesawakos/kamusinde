import { type NextRequest, NextResponse } from "next/server"
import { createClass, getClasses } from "@/lib/action/class.actions"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    await createClass(formData)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating class:", error)
    return NextResponse.json({ error: error.message || "Failed to create class" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const academicYear = searchParams.get("academicYear") || ""
    const form = searchParams.get("form") || ""
    const isActive = searchParams.get("isActive") !== "false"

    const result = await getClasses({
      page,
      limit,
      search,
      academicYear,
      form,
      isActive,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error fetching classes:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch classes" }, { status: 500 })
  }
}
