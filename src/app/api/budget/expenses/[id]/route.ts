import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { verifyAuthToken } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await verifyAuthToken(request)
    const expenseId = params.id

    const query = "DELETE FROM expenses WHERE id = ? AND user_id = ?"
    await executeQuery(query, [expenseId, user.id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting expense:", error)
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 })
  }
}
