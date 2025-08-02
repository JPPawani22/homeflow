"use client"

import { useState } from "react"
import type { Expense } from "@/types"

interface MobileExpenseItemProps {
  expense: Expense
  onDelete: (id: number) => void
  onEdit?: (expense: Expense) => void
}

export default function MobileExpenseItem({ expense, onDelete, onEdit }: MobileExpenseItemProps) {
  const [showActions, setShowActions] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="mobile-expense-item d-mobile-only">
      <div className="expense-header">
        <div>
          <div className="expense-title">{expense.title}</div>
          {expense.description && <div className="text-muted small">{expense.description}</div>}
        </div>
        <div className="expense-amount">{formatCurrency(Number.parseFloat(expense.amount.toString()))}</div>
      </div>

      <div className="expense-details">
        <div className="d-flex align-items-center gap-2">
          <span className="expense-category">{expense.category || "Uncategorized"}</span>
          <small>{formatDate(expense.expense_date)}</small>
        </div>
        <button className="btn btn-link p-0 text-muted" onClick={() => setShowActions(!showActions)}>
          <i className="bi bi-three-dots"></i>
        </button>
      </div>

      {showActions && (
        <div className="expense-actions">
          {onEdit && (
            <button className="btn btn-outline-primary" onClick={() => onEdit(expense)}>
              <i className="bi bi-pencil me-1"></i>
              Edit
            </button>
          )}
          <button
            className="btn btn-outline-danger"
            onClick={() => {
              if (window.confirm("Delete this expense?")) {
                onDelete(expense.id)
              }
            }}
          >
            <i className="bi bi-trash me-1"></i>
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
