"use client"

import { useState, useEffect } from "react"
import { auth } from "@/lib/firebase"
import type { Expense, BudgetSettings as BudgetSettingsType, CreateExpenseDTO, UpdateBudgetDTO } from "@/types"
import ExpenseForm from "./ExpenseForm"
import ExpenseList from "./ExpenseList"
import BudgetOverview from "./BudgetOverview"
import ExpenseCharts from "./ExpenseCharts"
import BudgetSettings from "./BudgetSettings"

interface BudgetModuleProps {
  compact?: boolean
}

interface BudgetData {
  expenses: Expense[]
  budget: BudgetSettingsType & {
    current_month_spent: number
    remaining: number
  }
}

export default function BudgetModule({ compact = false }: BudgetModuleProps) {
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "expenses" | "charts" | "settings">("overview")
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [showExpenseForm, setShowExpenseForm] = useState(false)

  useEffect(() => {
    fetchBudgetData()
  }, [selectedMonth])

  const fetchBudgetData = async () => {
    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()
      const response = await fetch(`/api/budget?month=${selectedMonth}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBudgetData(data)
      }
    } catch (error) {
      console.error("Error fetching budget data:", error)
    } finally {
      setLoading(false)
    }
  }

  const createExpense = async (expenseData: CreateExpenseDTO) => {
    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()
      const response = await fetch("/api/budget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expenseData),
      })

      if (response.ok) {
        fetchBudgetData()
        setShowExpenseForm(false)
      }
    } catch (error) {
      console.error("Error creating expense:", error)
    }
  }

  const updateBudget = async (budgetData: UpdateBudgetDTO) => {
    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()
      const response = await fetch("/api/budget", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(budgetData),
      })

      if (response.ok) {
        fetchBudgetData()
      }
    } catch (error) {
      console.error("Error updating budget:", error)
    }
  }

  const deleteExpense = async (id: number) => {
    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()
      const response = await fetch(`/api/budget/expenses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchBudgetData()
      }
    } catch (error) {
      console.error("Error deleting expense:", error)
    }
  }

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!budgetData) {
    return (
      <div className="text-center p-4">
        <p className="text-muted">Failed to load budget data</p>
      </div>
    )
  }

  if (compact) {
    return (
      <BudgetOverview
        budget={budgetData.budget}
        expenses={budgetData.expenses}
        compact={true}
        onMonthChange={setSelectedMonth}
        selectedMonth={selectedMonth}
      />
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3>Budget & Expenses</h3>
          <p className="text-muted mb-0">
            Track your spending and manage your budget for{" "}
            {new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="d-flex gap-2">
          <input
            type="month"
            className="form-control"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ width: "auto" }}
          />
          <button className="btn btn-primary" onClick={() => setShowExpenseForm(true)}>
            <i className="bi bi-plus-circle me-2"></i>
            Add Expense
          </button>
        </div>
      </div>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <ExpenseForm
          onSubmit={createExpense}
          onCancel={() => setShowExpenseForm(false)}
          selectedMonth={selectedMonth}
        />
      )}

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <i className="bi bi-pie-chart me-2"></i>
            Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "expenses" ? "active" : ""}`}
            onClick={() => setActiveTab("expenses")}
          >
            <i className="bi bi-receipt me-2"></i>
            Expenses
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "charts" ? "active" : ""}`}
            onClick={() => setActiveTab("charts")}
          >
            <i className="bi bi-bar-chart me-2"></i>
            Analytics
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <i className="bi bi-gear me-2"></i>
            Settings
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "overview" && (
          <BudgetOverview
            budget={budgetData.budget}
            expenses={budgetData.expenses}
            onMonthChange={setSelectedMonth}
            selectedMonth={selectedMonth}
          />
        )}

        {activeTab === "expenses" && <ExpenseList expenses={budgetData.expenses} onDelete={deleteExpense} />}

        {activeTab === "charts" && <ExpenseCharts expenses={budgetData.expenses} budget={budgetData.budget} />}

        {activeTab === "settings" && (
          <BudgetSettings budget={budgetData.budget} onUpdate={updateBudget} selectedMonth={selectedMonth} />
        )}
      </div>
    </div>
  )
}
