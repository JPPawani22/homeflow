"use client"

import { useState, useEffect } from "react"
import { auth } from "@/lib/firebase"
import type { Expense, BudgetSettings as BudgetSettingsType, CreateExpenseDTO, UpdateBudgetDTO } from "@/types"
import ExpenseForm from "./ExpenseForm"
import ExpenseList from "./ExpenseList"
import BudgetOverview from "./BudgetOverview"
import ExpenseCharts from "./ExpenseCharts"
import BudgetSettings from "./BudgetSettings"

// Add mobile imports at the top
import MobileStatsGrid from "@/components/mobile/MobileStatsGrid"
import MobileExpenseItem from "@/components/mobile/MobileExpenseItem"
import MobileBottomSheet from "@/components/mobile/MobileBottomSheet"
import { formatCurrency } from "@/lib/utils"

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
      <div>
        {/* Mobile Stats Grid */}
        <div className="d-mobile-only">
          <MobileStatsGrid
            stats={[
              {
                label: "Budget",
                value: formatCurrency(budgetData.budget.monthly_budget),
                color: "primary",
                icon: "bi-wallet2",
              },
              {
                label: "Spent",
                value: formatCurrency(budgetData.budget.current_month_spent),
                color: "danger",
                icon: "bi-credit-card",
              },
              {
                label: budgetData.budget.remaining >= 0 ? "Remaining" : "Over",
                value: formatCurrency(Math.abs(budgetData.budget.remaining)),
                color: budgetData.budget.remaining >= 0 ? "success" : "warning",
                icon: budgetData.budget.remaining >= 0 ? "bi-piggy-bank" : "bi-exclamation-triangle",
              },
              { label: "Transactions", value: budgetData.expenses.length, color: "info", icon: "bi-receipt" },
            ]}
          />
        </div>

        {/* Desktop compact view */}
        <div className="d-mobile-none">
          <BudgetOverview
            budget={budgetData.budget}
            expenses={budgetData.expenses}
            compact={true}
            onMonthChange={setSelectedMonth}
            selectedMonth={selectedMonth}
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header - Desktop */}
      <div className="d-flex justify-content-between align-items-center mb-4 d-mobile-none">
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

      {/* Mobile Header */}
      <div className="d-mobile-only mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <input
            type="month"
            className="form-control"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ maxWidth: "200px" }}
          />
          <button className="btn btn-sm btn-primary ms-2" onClick={() => setShowExpenseForm(true)}>
            <i className="bi bi-plus-circle me-1"></i>
            Add Expense
          </button>
        </div>
      </div>

      {/* Mobile FAB */}
      {/* <button className="mobile-fab d-mobile-only" onClick={() => setShowExpenseForm(true)}>
        <i className="bi bi-plus"></i>
      </button> */}

      {/* Expense Form - Desktop */}
      <div className="d-mobile-none">
        {showExpenseForm && (
          <ExpenseForm
            onSubmit={createExpense}
            onCancel={() => setShowExpenseForm(false)}
            selectedMonth={selectedMonth}
          />
        )}
      </div>

      {/* Expense Form - Mobile Bottom Sheet */}
      {/* <MobileBottomSheet isOpen={showExpenseForm} onClose={() => setShowExpenseForm(false)} title="Add New Expense">
        <ExpenseForm
          onSubmit={createExpense}
          onCancel={() => setShowExpenseForm(false)}
          selectedMonth={selectedMonth}
        />
      </MobileBottomSheet> */}
      {showExpenseForm && (
        
          <ExpenseForm
            onSubmit={createExpense}
            onCancel={() => setShowExpenseForm(false)}
            selectedMonth={selectedMonth}
          />
      )}

      {/* Navigation Tabs - Desktop */}
      <ul className="nav nav-tabs mb-4 d-mobile-none">
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

      {/* Navigation Tabs - Mobile */}
      <div className="d-mobile-only mb-3">
        <div className="d-flex justify-content-between gap-1 py-2">
          <button
            className={`btn btn-sm flex-fill ${activeTab === "overview" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`btn btn-sm flex-fill ${activeTab === "expenses" ? "btn-outline-secondary" : "btn-outline-secondary"}`}
            onClick={() => setActiveTab("expenses")}
          >
            Expenses
          </button>
          <button
            className={`btn btn-sm flex-fill ${activeTab === "charts" ? "btn-outline-info" : "btn-outline-info"}`}
            onClick={() => setActiveTab("charts")}
          >
            Charts
          </button>
          <button
            className={`btn btn-sm flex-fill ${activeTab === "settings" ? "btn-outline-warning" : "btn-outline-warning"}`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
        </div>
      </div>

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

        {activeTab === "expenses" && (
          <div>
            {/* Desktop Expense List */}
            <div className="d-mobile-none">
              <ExpenseList expenses={budgetData.expenses} onDelete={deleteExpense} />
            </div>

            {/* Mobile Expense List */}
            <div className="d-mobile-only">
              {budgetData.expenses.length === 0 ? (
                <div className="mobile-empty-state">
                  <div className="empty-icon">
                    <i className="bi bi-receipt"></i>
                  </div>
                  <div className="empty-title">No expenses yet</div>
                  <div className="empty-description">Start tracking your expenses by adding your first expense</div>
                  <div className="empty-action">
                    <button className="btn btn-primary" onClick={() => setShowExpenseForm(true)}>
                      <i className="bi bi-plus-circle me-2"></i>
                      Add Your First Expense
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {budgetData.expenses.map((expense) => (
                    <MobileExpenseItem key={expense.id} expense={expense} onDelete={deleteExpense} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "charts" && <ExpenseCharts expenses={budgetData.expenses} budget={budgetData.budget} />}

        {activeTab === "settings" && (
          <BudgetSettings budget={budgetData.budget} onUpdate={updateBudget} selectedMonth={selectedMonth} />
        )}
      </div>
    </div>
  )
}
