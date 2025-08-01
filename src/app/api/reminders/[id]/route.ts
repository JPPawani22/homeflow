import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { verifyAuthToken } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await verifyAuthToken(request)
    const data = await request.json()
    const reminderId = params.id

    // Format the date to MySQL compatible format
    const formattedDate = new Date(data.reminder_date).toISOString().slice(0, 19).replace('T', ' ')

    const query = `
      UPDATE reminders 
      SET title = ?, description = ?, reminder_date = ?, priority = ?, 
          reminder_type = ?, is_completed = ?
      WHERE id = ? AND user_id = ?
    `

    await executeQuery(query, [
      data.title,
      data.description || null,
      formattedDate, // Use the formatted date here
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
    const { user } = await verifyAuthToken(request)
    const reminderId = params.id

    const query = "DELETE FROM reminders WHERE id = ? AND user_id = ?"
    await executeQuery(query, [reminderId, user.id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting reminder:", error)
    return NextResponse.json({ error: "Failed to delete reminder" }, { status: 500 })
  }
}