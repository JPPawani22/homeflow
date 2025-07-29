// API route to sync Firebase user with MySQL database
import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { firebaseUid, email, displayName } = await request.json()

    if (!firebaseUid || !email) {
      return NextResponse.json({ error: "Firebase UID and email are required" }, { status: 400 })
    }

    await createUser(firebaseUid, email, displayName)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error syncing user:", error)
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 })
  }
}
