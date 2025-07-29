"use client"

import { useMemo } from "react"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts"
import type { Expense, BudgetSettings } from "@/types"

interface ExpenseChartsProps {
  expenses: Expense[]
  budget: BudgetSettings & {
    current_month_spent: number
    remaining: number
  }
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6", "#f97316", "#84cc16"]

export default function ExpenseCharts({ expenses, budget }: ExpenseChartsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const categoryData = useMemo(() => {
    const categories: { [key: string]: number } = {}
    expenses.forEach((expense) => {
      const category = expense.category || "Uncategorized"
      categories[category] = (categories[category] || 0) + Number.parseFloat(expense.amount.toString())
    })

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [expenses])

  const dailySpendingData = useMemo(() => {
    const dailyTotals: { [key: string]: number } = {}
    expenses.forEach((expense) => {
      const date = expense.expense_date
      dailyTotals[date] = (dailyTotals[date] || 0) + Number.parseFloat(expense.amount.toString())
    })

    return Object.entries(dailyTotals)
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        amount,
        fullDate: date,
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
      .slice(-14) // Last 14 days
  }, [expenses])

  const weeklyData = useMemo(() => {
    const weeklyTotals: { [key: string]: number } = {}
    expenses.forEach((expense) => {
      const date = new Date(expense.expense_date)
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
      const weekKey = weekStart.toISOString().split("T")[0]
      weeklyTotals[weekKey] = (weeklyTotals[weekKey] || 0) + Number.parseFloat(expense.amount.toString())
    })

    return Object.entries(weeklyTotals)
      .map(([date, amount]) => ({
        week: `Week of ${new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        amount,
        date,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-8) // Last 8 weeks
  }, [expenses])

  const budgetComparisonData = [
    {
      name: "Budget vs Spending",
      budget: budget.monthly_budget,
      spent: budget.current_month_spent,
      remaining: Math.max(0, budget.remaining),
    },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="fw-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="mb-0" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="row">
      {/* Category Breakdown - Pie Chart */}
      <div className="col-lg-6 mb-4">
        <div className="homeflow-card card h-100">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-pie-chart me-2"></i>
              Spending by Category
            </h5>
          </div>
          <div className="card-body">
            {categoryData.length === 0 ? (
              <div className="text-center p-4">
                <i className="bi bi-pie-chart display-4 text-muted"></i>
                <p className="text-muted mt-3">No expense data to display</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {categoryData.length > 0 && (
              <div className="mt-3">
                <div className="row">
                  {categoryData.slice(0, 4).map((category, index) => (
                    <div key={category.name} className="col-6 mb-2">
                      <div className="d-flex align-items-center">
                        <div
                          className="me-2"
                          style={{
                            width: "12px",
                            height: "12px",
                            backgroundColor: COLORS[index % COLORS.length],
                            borderRadius: "50%",
                          }}
                        ></div>
                        <small className="text-muted">{category.name}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Budget Comparison */}
      <div className="col-lg-6 mb-4">
        <div className="homeflow-card card h-100">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-bar-chart me-2"></i>
              Budget vs Spending
            </h5>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="budget" fill="#6366f1" name="Budget" />
                <Bar dataKey="spent" fill="#ef4444" name="Spent" />
                <Bar dataKey="remaining" fill="#10b981" name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 text-center">
              <div className="row">
                <div className="col-4">
                  <div className="text-primary fw-bold">{formatCurrency(budget.monthly_budget)}</div>
                  <small className="text-muted">Budget</small>
                </div>
                <div className="col-4">
                  <div className="text-danger fw-bold">{formatCurrency(budget.current_month_spent)}</div>
                  <small className="text-muted">Spent</small>
                </div>
                <div className="col-4">
                  <div className={`fw-bold ${budget.remaining >= 0 ? "text-success" : "text-warning"}`}>
                    {formatCurrency(Math.abs(budget.remaining))}
                  </div>
                  <small className="text-muted">{budget.remaining >= 0 ? "Remaining" : "Over Budget"}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Spending Trend */}
      <div className="col-lg-12 mb-4">
        <div className="homeflow-card card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-graph-up me-2"></i>
              Daily Spending Trend (Last 14 Days)
            </h5>
          </div>
          <div className="card-body">
            {dailySpendingData.length === 0 ? (
              <div className="text-center p-4">
                <i className="bi bi-graph-up display-4 text-muted"></i>
                <p className="text-muted mt-3">No daily spending data to display</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailySpendingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1" }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Category Spending Bar Chart */}
      <div className="col-lg-12 mb-4">
        <div className="homeflow-card card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-bar-chart-line me-2"></i>
              Category Spending Breakdown
            </h5>
          </div>
          <div className="card-body">
            {categoryData.length === 0 ? (
              <div className="text-center p-4">
                <i className="bi bi-bar-chart-line display-4 text-muted"></i>
                <p className="text-muted mt-3">No category data to display</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#6366f1">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
