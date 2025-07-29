// API routes for budget and expenses management
import { type NextRequest, NextResponse } from "next/server"
import { executeQuery, getUserByFirebaseUid } from "@/lib/database"
import type { CreateExpenseDTO, UpdateBudgetDTO } from "@/types"

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

    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7)

    // Get expenses for the month
    const expensesQuery = `
      SELECT * FROM expenses 
      WHERE user_id = ? AND DATE_FORMAT(expense_date, '%Y-%m') = ?
      ORDER BY expense_date DESC
    `
    const expenses = await executeQuery(expensesQuery, [user.id, month])

    // Get budget settings for the month
    const budgetQuery = `
      SELECT * FROM budget_settings 
      WHERE user_id = ? AND budget_month = ?
    `
    const budgetResult = (await executeQuery(budgetQuery, [user.id, month])) as any[]
    const budget = budgetResult[0] || { monthly_budget: 0, current_month_spent: 0 }

    // Calculate total spent
    const totalSpent = (expenses as any[]).reduce((sum, expense) => sum + Number.parseFloat(expense.amount), 0)

    return NextResponse.json({
      expenses,
      budget: {
        ...budget,
        current_month_spent: totalSpent,
        remaining: budget.monthly_budget - totalSpent,
      },
    })
  } catch (error) {
    console.error("Error fetching budget data:", error)
    return NextResponse.json({ error: "Failed to fetch budget data" }, { status: 500 })
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

    const data: CreateExpenseDTO = await request.json()

    const query = `
      INSERT INTO expenses (user_id, title, amount, category, expense_date, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `

    const result = await executeQuery(query, [
      user.id,
      data.title,
      data.amount,
      data.category || null,
      data.expense_date,
      data.description || null,
    ])

    return NextResponse.json({ success: true, id: (result as any).insertId })
  } catch (error) {
    console.error("Error creating expense:", error)
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const { uid } = await verifyToken(authHeader)

    const user = await getUserByFirebaseUid(uid)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const data: UpdateBudgetDTO = await request.json()

    const query = `
      INSERT INTO budget_settings (user_id, monthly_budget, budget_month)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE monthly_budget = VALUES(monthly_budget)
    `

    await executeQuery(query, [user.id, data.monthly_budget, data.budget_month])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating budget:", error)
    return NextResponse.json({ error: "Failed to update budget" }, { status: 500 })
  }
}
