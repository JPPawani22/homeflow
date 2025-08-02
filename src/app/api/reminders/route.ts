import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { verifyAuthToken } from "@/lib/auth"
import type { CreateReminderDTO } from "@/types"

export async function GET(request: NextRequest) {
  try {
    const { user } = await verifyAuthToken(request)

    const query = `
      SELECT * FROM reminders 
      WHERE user_id = ? 
      ORDER BY reminder_date ASC
    `
    const reminders = await executeQuery(query, [user.id])

    return NextResponse.json(reminders)
  } catch (error) {
    console.error("Error fetching reminders:", error)
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await verifyAuthToken(request)
    const data: CreateReminderDTO = await request.json()

    // Format the date to MySQL compatible format
    const formattedDate = new Date(data.reminder_date).toISOString().slice(0, 19).replace('T', ' ')

    const query = `
      INSERT INTO reminders (user_id, title, description, reminder_date, priority, reminder_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `

    const result = await executeQuery(query, [
      user.id,
      data.title,
      data.description || null,
      formattedDate, // Use the formatted date here
      data.priority,
      data.reminder_type,
    ])

    return NextResponse.json({ success: true, id: (result as any).insertId })
  } catch (error) {
    console.error("Error creating reminder:", error)
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 })
  }
}