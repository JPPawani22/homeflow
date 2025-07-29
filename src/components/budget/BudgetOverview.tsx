"use client"

import type { Expense, BudgetSettings } from "@/types"

interface BudgetOverviewProps {
  budget: BudgetSettings & {
    current_month_spent: number
    remaining: number
  }
  expenses: Expense[]
  compact?: boolean
  onMonthChange?: (month: string) => void
  selectedMonth: string
}

export default function BudgetOverview({
  budget,
  expenses,
  compact = false,
  onMonthChange,
  selectedMonth,
}: BudgetOverviewProps) {
  const getSpendingPercentage = () => {
    if (budget.monthly_budget === 0) return 0
    return Math.min((budget.current_month_spent / budget.monthly_budget) * 100, 100)
  }

  const getProgressBarColor = () => {
    const percentage = getSpendingPercentage()
    if (percentage >= 90) return "danger"
    if (percentage >= 75) return "warning"
    return "success"
  }

  const getRecentExpenses = () => {
    return expenses
      .sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime())
      .slice(0, compact ? 3 : 5)
  }

  const getCategoryTotals = () => {
    const categories: { [key: string]: number } = {}
    expenses.forEach((expense) => {
      const category = expense.category || "Uncategorized"
      categories[category] = (categories[category] || 0) + Number.parseFloat(expense.amount.toString())
    })
    return Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (compact) {
    return (
      <div>
        {/* Budget Progress */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-medium">Monthly Budget</span>
            <span className="text-muted">
              {formatCurrency(budget.current_month_spent)} / {formatCurrency(budget.monthly_budget)}
            </span>
          </div>
          <div className="progress" style={{ height: "8px" }}>
            <div
              className={`progress-bar bg-${getProgressBarColor()}`}
              role="progressbar"
              style={{ width: `${getSpendingPercentage()}%` }}
              aria-valuenow={getSpendingPercentage()}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <div className="d-flex justify-content-between mt-1">
            <small className="text-muted">{getSpendingPercentage().toFixed(1)}% used</small>
            <small className={`${budget.remaining >= 0 ? "text-success" : "text-danger"}`}>
              {budget.remaining >= 0 ? "Remaining: " : "Over budget: "}
              {formatCurrency(Math.abs(budget.remaining))}
            </small>
          </div>
        </div>

        {/* Recent Expenses */}
        <div>
          <h6 className="mb-2">Recent Expenses</h6>
          {getRecentExpenses().length === 0 ? (
            <p className="text-muted small">No expenses this month</p>
          ) : (
            <div className="list-group list-group-flush">
              {getRecentExpenses().map((expense) => (
                <div key={expense.id} className="list-group-item border-0 px-0 py-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-medium">{expense.title}</div>
                      <small className="text-muted">{expense.category}</small>
                    </div>
                    <div className="text-end">
                      <div className="fw-medium">{formatCurrency(Number.parseFloat(expense.amount.toString()))}</div>
                      <small className="text-muted">{new Date(expense.expense_date).toLocaleDateString()}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="row">
      {/* Budget Summary Cards */}
      <div className="col-lg-8 mb-4">
        <div className="row">
          <div className="col-md-3 mb-3">
            <div className="homeflow-card card border-primary h-100">
              <div className="card-body text-center">
                <i className="bi bi-wallet2 display-6 text-primary mb-2"></i>
                <h5 className="text-primary mb-1">{formatCurrency(budget.monthly_budget)}</h5>
                <small className="text-muted">Monthly Budget</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="homeflow-card card border-danger h-100">
              <div className="card-body text-center">
                <i className="bi bi-credit-card display-6 text-danger mb-2"></i>
                <h5 className="text-danger mb-1">{formatCurrency(budget.current_month_spent)}</h5>
                <small className="text-muted">Total Spent</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className={`homeflow-card card border-${budget.remaining >= 0 ? "success" : "warning"} h-100`}>
              <div className="card-body text-center">
                <i
                  className={`bi ${budget.remaining >= 0 ? "bi-piggy-bank" : "bi-exclamation-triangle"} display-6 text-${budget.remaining >= 0 ? "success" : "warning"} mb-2`}
                ></i>
                <h5 className={`text-${budget.remaining >= 0 ? "success" : "warning"} mb-1`}>
                  {formatCurrency(Math.abs(budget.remaining))}
                </h5>
                <small className="text-muted">{budget.remaining >= 0 ? "Remaining" : "Over Budget"}</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="homeflow-card card border-info h-100">
              <div className="card-body text-center">
                <i className="bi bi-receipt display-6 text-info mb-2"></i>
                <h5 className="text-info mb-1">{expenses.length}</h5>
                <small className="text-muted">Transactions</small>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Progress */}
        <div className="homeflow-card card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-graph-up me-2"></i>
              Budget Progress
            </h5>
          </div>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="fw-medium">
                {new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
              <span className="badge bg-primary">{getSpendingPercentage().toFixed(1)}% used</span>
            </div>
            <div className="progress mb-3" style={{ height: "20px" }}>
              <div
                className={`progress-bar bg-${getProgressBarColor()}`}
                role="progressbar"
                style={{ width: `${getSpendingPercentage()}%` }}
                aria-valuenow={getSpendingPercentage()}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                {getSpendingPercentage().toFixed(1)}%
              </div>
            </div>
            <div className="row text-center">
              <div className="col-4">
                <div className="text-muted small">Spent</div>
                <div className="fw-bold">{formatCurrency(budget.current_month_spent)}</div>
              </div>
              <div className="col-4">
                <div className="text-muted small">Budget</div>
                <div className="fw-bold">{formatCurrency(budget.monthly_budget)}</div>
              </div>
              <div className="col-4">
                <div className="text-muted small">{budget.remaining >= 0 ? "Remaining" : "Over"}</div>
                <div className={`fw-bold text-${budget.remaining >= 0 ? "success" : "danger"}`}>
                  {formatCurrency(Math.abs(budget.remaining))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <div className="col-lg-4">
        {/* Top Categories */}
        <div className="homeflow-card card mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-pie-chart me-2"></i>
              Top Categories
            </h5>
          </div>
          <div className="card-body">
            {getCategoryTotals().length === 0 ? (
              <p className="text-muted text-center">No expenses yet</p>
            ) : (
              <div className="list-group list-group-flush">
                {getCategoryTotals().map(([category, amount], index) => (
                  <div key={category} className="list-group-item border-0 px-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <div
                          className={`badge bg-${
                            ["primary", "success", "warning", "info", "secondary"][index % 5]
                          } me-2`}
                          style={{ width: "12px", height: "12px", borderRadius: "50%" }}
                        ></div>
                        <span>{category}</span>
                      </div>
                      <div className="text-end">
                        <div className="fw-medium">{formatCurrency(amount)}</div>
                        <small className="text-muted">
                          {budget.current_month_spent > 0
                            ? ((amount / budget.current_month_spent) * 100).toFixed(1)
                            : 0}
                          %
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="homeflow-card card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-clock-history me-2"></i>
              Recent Expenses
            </h5>
          </div>
          <div className="card-body">
            {getRecentExpenses().length === 0 ? (
              <p className="text-muted text-center">No expenses yet</p>
            ) : (
              <div className="list-group list-group-flush">
                {getRecentExpenses().map((expense) => (
                  <div key={expense.id} className="list-group-item border-0 px-0">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fw-medium">{expense.title}</div>
                        <small className="text-muted">{expense.category}</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-medium">{formatCurrency(Number.parseFloat(expense.amount.toString()))}</div>
                        <small className="text-muted">{new Date(expense.expense_date).toLocaleDateString()}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
