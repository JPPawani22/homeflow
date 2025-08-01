"use client"

import { useState } from "react"
import type { Expense } from "@/types"

// Add mobile imports at the top
import MobileExpenseItem from "@/components/mobile/MobileExpenseItem"

interface ExpenseListProps {
  expenses: Expense[]
  onDelete: (id: number) => void
}

export default function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  const [sortBy, setSortBy] = useState<"date" | "amount" | "category">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterCategory, setFilterCategory] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getUniqueCategories = () => {
    const categories = [...new Set(expenses.map((expense) => expense.category || "Uncategorized"))]
    return categories.sort()
  }

  const getSortedAndFilteredExpenses = () => {
    let filtered = expenses

    // Filter by category
    if (filterCategory) {
      filtered = filtered.filter((expense) => (expense.category || "Uncategorized") === filterCategory)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (expense) =>
          expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (expense.description && expense.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (expense.category && expense.category.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case "amount":
          aValue = Number.parseFloat(a.amount.toString())
          bValue = Number.parseFloat(b.amount.toString())
          break
        case "category":
          aValue = a.category || "Uncategorized"
          bValue = b.category || "Uncategorized"
          break
        case "date":
        default:
          aValue = new Date(a.expense_date).getTime()
          bValue = new Date(b.expense_date).getTime()
          break
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }

  const handleSort = (field: "date" | "amount" | "category") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  const getTotalAmount = () => {
    return getSortedAndFilteredExpenses().reduce(
      (sum, expense) => sum + Number.parseFloat(expense.amount.toString()),
      0,
    )
  }

  const filteredExpenses = getSortedAndFilteredExpenses()

  // Update the main return section to include mobile layout
  return (
    <div>
      {/* Filters and Search - Desktop */}
      <div className="homeflow-card card mb-4 d-mobile-none">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-3">
              <label htmlFor="search" className="form-label">
                Search Expenses
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  id="search"
                  placeholder="Search by title, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <label htmlFor="category-filter" className="form-label">
                Filter by Category
              </label>
              <select
                className="form-select"
                id="category-filter"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {getUniqueCategories().map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Sort Options</label>
              <div className="btn-group w-100" role="group">
                <button
                  type="button"
                  className={`btn ${sortBy === "date" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => handleSort("date")}
                >
                  Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>
                <button
                  type="button"
                  className={`btn ${sortBy === "amount" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => handleSort("amount")}
                >
                  Amount {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>
                <button
                  type="button"
                  className={`btn ${sortBy === "category" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => handleSort("category")}
                >
                  Category {sortBy === "category" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>
              </div>
            </div>
          </div>
          {(searchTerm || filterCategory) && (
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                Showing {filteredExpenses.length} of {expenses.length} expenses
              </small>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setSearchTerm("")
                  setFilterCategory("")
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="mobile-search mb-3 d-mobile-only">
        <input
          type="text"
          className="search-input"
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <i className="search-icon bi bi-search"></i>
        {searchTerm && (
          <button className="search-clear" onClick={() => setSearchTerm("")}>
            <i className="bi bi-x"></i>
          </button>
        )}
      </div>

      {/* Mobile Filters */}
      <div className="d-mobile-only mb-3">
        <select className="form-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {getUniqueCategories().map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Summary - Desktop */}
      <div className="row mb-4 d-mobile-none">
        <div className="col-md-4">
          <div className="homeflow-card card border-info">
            <div className="card-body text-center">
              <h5 className="text-info mb-1">{filteredExpenses.length}</h5>
              <small className="text-muted">Transactions</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="homeflow-card card border-primary">
            <div className="card-body text-center">
              <h5 className="text-primary mb-1">{formatCurrency(getTotalAmount())}</h5>
              <small className="text-muted">Total Amount</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="homeflow-card card border-success">
            <div className="card-body text-center">
              <h5 className="text-success mb-1">
                {filteredExpenses.length > 0 ? formatCurrency(getTotalAmount() / filteredExpenses.length) : "$0.00"}
              </h5>
              <small className="text-muted">Average</small>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Summary */}
      <div className="d-mobile-only mb-3">
        <div className="mobile-stats-grid">
          <div className="stat-card border-info">
            <div className="stat-value text-info">{filteredExpenses.length}</div>
            <div className="stat-label">Transactions</div>
          </div>
          <div className="stat-card border-primary">
            <div className="stat-value text-primary">{formatCurrency(getTotalAmount())}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
      </div>

      {/* Expense List - Desktop */}
      <div className="homeflow-card card d-mobile-none">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-receipt me-2"></i>
            Expense Details
          </h5>
        </div>
        <div className="card-body">
          {filteredExpenses.length === 0 ? (
            <div className="text-center p-4">
              <i className="bi bi-receipt display-4 text-muted"></i>
              <h5 className="mt-3">No expenses found</h5>
              <p className="text-muted">
                {expenses.length === 0
                  ? "Start tracking your expenses by adding your first expense"
                  : "Try adjusting your search or filter criteria"}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>
                        <div className="fw-medium">{new Date(expense.expense_date).toLocaleDateString()}</div>
                        <small className="text-muted">
                          {new Date(expense.expense_date).toLocaleDateString("en-US", { weekday: "short" })}
                        </small>
                      </td>
                      <td>
                        <div className="fw-medium">{expense.title}</div>
                        {expense.description && <small className="text-muted d-block">{expense.description}</small>}
                      </td>
                      <td>
                        <span className="badge bg-secondary">{expense.category || "Uncategorized"}</span>
                      </td>
                      <td>
                        <span className="fw-bold text-danger">
                          {formatCurrency(Number.parseFloat(expense.amount.toString()))}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this expense?")) {
                              onDelete(expense.id)
                            }
                          }}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Expense List - Mobile */}
      <div className="d-mobile-only">
        {filteredExpenses.length === 0 ? (
          <div className="mobile-empty-state">
            <div className="empty-icon">
              <i className="bi bi-receipt"></i>
            </div>
            <div className="empty-title">No expenses found</div>
            <div className="empty-description">
              {expenses.length === 0
                ? "Start tracking your expenses by adding your first expense"
                : "Try adjusting your search or filter criteria"}
            </div>
          </div>
        ) : (
          <div>
            {filteredExpenses.map((expense) => (
              <MobileExpenseItem key={expense.id} expense={expense} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
