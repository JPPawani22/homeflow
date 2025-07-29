"use client"

import type React from "react"
import { useState } from "react"
import type { CreateExpenseDTO } from "@/types"

interface ExpenseFormProps {
  onSubmit: (expense: CreateExpenseDTO) => void
  onCancel: () => void
  selectedMonth: string
}

const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Groceries",
  "Gas",
  "Insurance",
  "Rent/Mortgage",
  "Subscriptions",
  "Other",
]

export default function ExpenseForm({ onSubmit, onCancel, selectedMonth }: ExpenseFormProps) {
  const [formData, setFormData] = useState<CreateExpenseDTO>({
    title: "",
    amount: 0,
    category: "",
    expense_date: new Date().toISOString().split("T")[0],
    description: "",
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0"
    }

    if (!formData.expense_date) {
      newErrors.expense_date = "Date is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    onSubmit({
      ...formData,
      category: formData.category || "Other",
      description: formData.description || undefined,
    })
  }

  const handleChange = (field: keyof CreateExpenseDTO, value: string | number) => {
    setFormData({ ...formData, [field]: value })

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  return (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-plus-circle me-2"></i>
              Add New Expense
            </h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-8 mb-3">
                  <label htmlFor="title" className="form-label">
                    Expense Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.title ? "is-invalid" : ""}`}
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="What did you spend on?"
                  />
                  {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="amount" className="form-label">
                    Amount <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      className={`form-control ${errors.amount ? "is-invalid" : ""}`}
                      id="amount"
                      value={formData.amount || ""}
                      onChange={(e) => handleChange("amount", Number.parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                    {errors.amount && <div className="invalid-feedback">{errors.amount}</div>}
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="category" className="form-label">
                    Category
                  </label>
                  <select
                    className="form-select"
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                  >
                    <option value="">Select a category</option>
                    {EXPENSE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="expense_date" className="form-label">
                    Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className={`form-control ${errors.expense_date ? "is-invalid" : ""}`}
                    id="expense_date"
                    value={formData.expense_date}
                    onChange={(e) => handleChange("expense_date", e.target.value)}
                  />
                  {errors.expense_date && <div className="invalid-feedback">{errors.expense_date}</div>}
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  className="form-control"
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Additional details about this expense..."
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                  <i className="bi bi-x-circle me-2"></i>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
