import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { verifyAuthToken } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await verifyAuthToken(request)
    const data = await request.json()
    const todoId = params.id

    const formattedDueDate = data.due_date
      ? new Date(data.due_date).toISOString().slice(0, 19).replace('T', ' ')
      : null

    const query = `
      UPDATE todos 
      SET title = ?, description = ?, priority = ?, due_date = ?, is_completed = ?
      WHERE id = ? AND user_id = ?
    `

    await executeQuery(query, [
      data.title,
      data.description || null,
      data.priority,
      formattedDueDate,
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
    const { user } = await verifyAuthToken(request)
    const todoId = params.id

    const query = "DELETE FROM todos WHERE id = ? AND user_id = ?"
    await executeQuery(query, [todoId, user.id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting todo:", error)
    return NextResponse.json({ error: "Failed to delete todo" }, { status: 500 })
  }
}
