"use client"

import type React from "react"
import { useState } from "react"
import type { BudgetSettings as BudgetSettingsType, UpdateBudgetDTO } from "@/types"

interface BudgetSettingsProps {
  budget: BudgetSettingsType & {
    current_month_spent: number
    remaining: number
  }
  onUpdate: (budget: UpdateBudgetDTO) => void
  selectedMonth: string
}

export default function BudgetSettings({ budget, onUpdate, selectedMonth }: BudgetSettingsProps) {
  const [monthlyBudget, setMonthlyBudget] = useState(budget.monthly_budget || 0)
  const [isEditing, setIsEditing] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({
      monthly_budget: monthlyBudget,
      budget_month: selectedMonth,
    })
    setIsEditing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getBudgetRecommendations = () => {
    const currentSpending = budget.current_month_spent
    const recommendations = []

    if (currentSpending > 0) {
      // 50/30/20 rule recommendations
      const needs = currentSpending * 1.5 // Assume current spending is 50% of needs
      const wants = currentSpending * 0.6 // 30% for wants
      const savings = currentSpending * 0.4 // 20% for savings
      const recommended = needs + wants + savings

      recommendations.push({
        title: "50/30/20 Rule",
        description: "50% needs, 30% wants, 20% savings",
        amount: recommended,
      })

      recommendations.push({
        title: "Conservative",
        description: "Based on current spending + 20% buffer",
        amount: currentSpending * 1.2,
      })

      recommendations.push({
        title: "Aggressive Saving",
        description: "Based on current spending + 10% buffer",
        amount: currentSpending * 1.1,
      })
    }

    return recommendations
  }

  return (
    <div className="row">
      <div className="col-lg-8">
        <div className="homeflow-card card mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-gear me-2"></i>
              Budget Settings
            </h5>
          </div>
          <div className="card-body">
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="monthly-budget" className="form-label">
                    Monthly Budget for{" "}
                    {new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      className="form-control"
                      id="monthly-budget"
                      value={monthlyBudget}
                      onChange={(e) => setMonthlyBudget(Number.parseFloat(e.target.value) || 0)}
                      placeholder="Enter your monthly budget"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-text">Set a realistic budget based on your income and expenses.</div>
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-check-circle me-2"></i>
                    Save Budget
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setIsEditing(false)
                      setMonthlyBudget(budget.monthly_budget || 0)
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h4 className="mb-1">{formatCurrency(budget.monthly_budget || 0)}</h4>
                    <p className="text-muted mb-0">
                      Monthly budget for{" "}
                      {new Date(selectedMonth + "-01").toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <button className="btn btn-outline-primary" onClick={() => setIsEditing(true)}>
                    <i className="bi bi-pencil me-2"></i>
                    Edit Budget
                  </button>
                </div>

                {budget.monthly_budget > 0 && (
                  <div className="row">
                    <div className="col-md-4">
                      <div className="text-center p-3 border rounded">
                        <div className="text-danger fw-bold">{formatCurrency(budget.current_month_spent)}</div>
                        <small className="text-muted">Spent</small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center p-3 border rounded">
                        <div className={`fw-bold ${budget.remaining >= 0 ? "text-success" : "text-warning"}`}>
                          {formatCurrency(Math.abs(budget.remaining))}
                        </div>
                        <small className="text-muted">{budget.remaining >= 0 ? "Remaining" : "Over Budget"}</small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center p-3 border rounded">
                        <div className="text-primary fw-bold">
                          {((budget.current_month_spent / budget.monthly_budget) * 100).toFixed(1)}%
                        </div>
                        <small className="text-muted">Used</small>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Budget Tips */}
        <div className="homeflow-card card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-lightbulb me-2"></i>
              Budget Tips & Best Practices
            </h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <div className="d-flex">
                  <div className="flex-shrink-0">
                    <i className="bi bi-check-circle-fill text-success"></i>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6>Track Every Expense</h6>
                    <p className="text-muted small mb-0">
                      Record all your expenses, no matter how small, to get an accurate picture of your spending.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="d-flex">
                  <div className="flex-shrink-0">
                    <i className="bi bi-check-circle-fill text-success"></i>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6>Review Monthly</h6>
                    <p className="text-muted small mb-0">
                      Review your budget monthly and adjust based on your actual spending patterns.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="d-flex">
                  <div className="flex-shrink-0">
                    <i className="bi bi-check-circle-fill text-success"></i>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6>Emergency Fund</h6>
                    <p className="text-muted small mb-0">
                      Set aside 10-15% of your budget for unexpected expenses and emergencies.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="d-flex">
                  <div className="flex-shrink-0">
                    <i className="bi bi-check-circle-fill text-success"></i>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6>Categorize Expenses</h6>
                    <p className="text-muted small mb-0">
                      Use categories to understand where your money goes and identify areas to cut back.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-lg-4">
        {/* Budget Recommendations */}
        <div className="homeflow-card card mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-calculator me-2"></i>
              Budget Recommendations
            </h5>
          </div>
          <div className="card-body">
            {getBudgetRecommendations().length === 0 ? (
              <p className="text-muted">Add some expenses to get personalized budget recommendations.</p>
            ) : (
              <div className="list-group list-group-flush">
                {getBudgetRecommendations().map((rec, index) => (
                  <div key={index} className="list-group-item border-0 px-0">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">{rec.title}</h6>
                        <p className="text-muted small mb-0">{rec.description}</p>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold">{formatCurrency(rec.amount)}</div>
                        <button
                          className="btn btn-sm btn-outline-primary mt-1"
                          onClick={() => {
                            setMonthlyBudget(rec.amount)
                            setIsEditing(true)
                          }}
                        >
                          Use This
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="homeflow-card card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-graph-up me-2"></i>
              Quick Stats
            </h5>
          </div>
          <div className="card-body">
            <div className="row text-center">
              <div className="col-12 mb-3">
                <div className="border-bottom pb-2">
                  <div className="h4 mb-1">{formatCurrency(budget.current_month_spent)}</div>
                  <small className="text-muted">Total Spent This Month</small>
                </div>
              </div>
              <div className="col-6">
                <div className="text-primary fw-bold">
                  {budget.monthly_budget > 0
                    ? `${((budget.current_month_spent / budget.monthly_budget) * 100).toFixed(0)}%`
                    : "0%"}
                </div>
                <small className="text-muted">Budget Used</small>
              </div>
              <div className="col-6">
                <div className="text-info fw-bold">
                  {new Date().getDate()}/{new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}
                </div>
                <small className="text-muted">Days Passed</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
