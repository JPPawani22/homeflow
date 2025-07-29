// API routes for individual todo operations
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
    const todoId = params.id

    const query = `
      UPDATE todos 
      SET title = ?, description = ?, priority = ?, due_date = ?, is_completed = ?
      WHERE id = ? AND user_id = ?
    `

    await executeQuery(query, [
      data.title,
      data.description || null,
      data.priority,
      data.due_date || null,
      data.is_completed || false,
      todoId,
      user.id,
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating todo:", error)
    return NextResponse.json({ error: "Failed to update todo" }, { status: 500 })
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

    const todoId = params.id
    const query = "DELETE FROM todos WHERE id = ? AND user_id = ?"

    await executeQuery(query, [todoId, user.id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting todo:", error)
    return NextResponse.json({ error: "Failed to delete todo" }, { status: 500 })
  }
}
