import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { verifyAuthToken } from "@/lib/auth"
import type { CreateTodoDTO } from "@/types"

export async function GET(request: NextRequest) {
  try {
    const { user } = await verifyAuthToken(request)

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
    const { user } = await verifyAuthToken(request)
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
