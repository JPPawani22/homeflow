// API routes for individual reminder operations
import { type NextRequest, NextResponse } from "next/server"
import { executeQuery, getUserByFirebaseUid } from "@/lib/database"

async function verifyToken(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("No valid authorization header")
  }
  const token = authHeader.split("Bearer ")[1]
  return { uid: token }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    const { uid } = await verifyToken(authHeader)

    const user = await getUserByFirebaseUid(uid)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const data = await request.json()
    const reminderId = params.id

    const query = `
      UPDATE reminders 
      SET title = ?, description = ?, reminder_date = ?, priority = ?, 
          reminder_type = ?, is_completed = ?
      WHERE id = ? AND user_id = ?
    `

    await executeQuery(query, [
      data.title,
      data.description || null,
      data.reminder_date,
      data.priority,
      data.reminder_type,
      data.is_completed || false,
      reminderId,
      user.id,
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating reminder:", error)
    return NextResponse.json({ error: "Failed to update reminder" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    const { uid } = await verifyToken(authHeader)

    const user = await getUserByFirebaseUid(uid)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const reminderId = params.id
    const query = "DELETE FROM reminders WHERE id = ? AND user_id = ?"

    await executeQuery(query, [reminderId, user.id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting reminder:", error)
    return NextResponse.json({ error: "Failed to delete reminder" }, { status: 500 })
  }
}
