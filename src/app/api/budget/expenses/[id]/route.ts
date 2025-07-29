// API route for individual expense operations
import { type NextRequest, NextResponse } from "next/server"
import { executeQuery, getUserByFirebaseUid } from "@/lib/database"

async function verifyToken(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("No valid authorization header")
  }
  const token = authHeader.split("Bearer ")[1]
  return { uid: token }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    const { uid } = await verifyToken(authHeader)

    const user = await getUserByFirebaseUid(uid)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const expenseId = params.id
    const query = "DELETE FROM expenses WHERE id = ? AND user_id = ?"

    await executeQuery(query, [expenseId, user.id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting expense:", error)
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 })
  }
}
