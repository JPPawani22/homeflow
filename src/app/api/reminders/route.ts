// API routes for reminders/events management
import { type NextRequest, NextResponse } from "next/server"
import { executeQuery, getUserByFirebaseUid } from "@/lib/database"
import type { CreateReminderDTO } from "@/types"

// Initialize Firebase Admin (add this to a separate admin config file in production)
import { getApps } from "firebase-admin/app"

if (!getApps().length) {
  // You'll need to add Firebase Admin SDK credentials
  // For now, we'll handle auth verification differently
}

async function verifyToken(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("No valid authorization header")
  }

  const token = authHeader.split("Bearer ")[1]
  // In production, verify the Firebase token here
  // For now, we'll extract the UID from the token (simplified)
  return { uid: token } // This should be properly implemented
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const { uid } = await verifyToken(authHeader)

    const user = await getUserByFirebaseUid(uid)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

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
    const authHeader = request.headers.get("authorization")
    const { uid } = await verifyToken(authHeader)

    const user = await getUserByFirebaseUid(uid)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const data: CreateReminderDTO = await request.json()

    const query = `
      INSERT INTO reminders (user_id, title, description, reminder_date, priority, reminder_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `

    const result = await executeQuery(query, [
      user.id,
      data.title,
      data.description || null,
      data.reminder_date,
      data.priority,
      data.reminder_type,
    ])

    return NextResponse.json({ success: true, id: (result as any).insertId })
  } catch (error) {
    console.error("Error creating reminder:", error)
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 })
  }
}
