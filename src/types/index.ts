// Type definitions for HomeFlow app

export interface User {
    id: number
    firebase_uid: string
    email: string
    display_name?: string
    created_at: string
    updated_at: string
}

export interface Reminder {
    id: number
    user_id: number
    title: string
    description?: string
    reminder_date: string
    priority: "low" | "medium" | "high"
    is_completed: boolean
    reminder_type: "reminder" | "event"
    created_at: string
    updated_at: string
}

export interface Todo {
    id: number
    user_id: number
    title: string
    description?: string
    is_completed: boolean
    priority: "low" | "medium" | "high"
    due_date?: string
    created_at: string
    updated_at: string
}

export interface Expense {
    id: number
    user_id: number
    title: string
    amount: number
    category?: string
    expense_date: string
    description?: string
    created_at: string
    updated_at: string
}

export interface BudgetSettings {
    id: number
    user_id: number
    monthly_budget: number
    current_month_spent: number
    budget_month: string
    created_at: string
    updated_at: string
}

// DTOs for API requests
export interface CreateReminderDTO {
    title: string
    description?: string
    reminder_date: string
    priority: "low" | "medium" | "high"
    reminder_type: "reminder" | "event"
}

export interface CreateTodoDTO {
    title: string
    description?: string
    priority: "low" | "medium" | "high"
    due_date?: string
}

export interface CreateExpenseDTO {
    title: string
    amount: number
    category?: string
    expense_date: string
    description?: string
}

export interface UpdateBudgetDTO {
    monthly_budget: number
    budget_month: string
}
