// API routes for todos management
import { type NextRequest, NextResponse } from "next/server"
import { executeQuery, getUserByFirebaseUid } from "@/lib/database"
import type { CreateTodoDTO } from "@/types"

async function verifyToken(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("No valid authorization header")
  }
  const token = authHeader.split("Bearer ")[1]
  return { uid: token }
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
      SELECT * FROM todos 
      WHERE user_id = ? 
      ORDER BY 
        CASE priority 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
        END,
        due_date ASC,
        created_at DESC
    `
    const todos = await executeQuery(query, [user.id])

    return NextResponse.json(todos)
  } catch (error) {
    console.error("Error fetching todos:", error)
    return NextResponse.json({ error: "Failed to fetch todos" }, { status: 500 })
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

    const data: CreateTodoDTO = await request.json()

    const query = `
      INSERT INTO todos (user_id, title, description, priority, due_date)
      VALUES (?, ?, ?, ?, ?)
    `

    const result = await executeQuery(query, [
      user.id,
      data.title,
      data.description || null,
      data.priority,
      data.due_date || null,
    ])

    return NextResponse.json({ success: true, id: (result as any).insertId })
  } catch (error) {
    console.error("Error creating todo:", error)
    return NextResponse.json({ error: "Failed to create todo" }, { status: 500 })
  }
}
