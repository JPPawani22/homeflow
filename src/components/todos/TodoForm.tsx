"use client"

import type React from "react"
import { useState } from "react"
import type { CreateTodoDTO } from "@/types"

interface TodoFormProps {
  onSubmit: (todo: CreateTodoDTO) => void
  onCancel: () => void
  
}

export default function TodoForm({ onSubmit, onCancel }: TodoFormProps) {
  const [formData, setFormData] = useState<CreateTodoDTO>({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (formData.due_date && new Date(formData.due_date) < new Date()) {
      newErrors.due_date = "Due date cannot be in the past"
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
      description: formData.description || undefined,
      due_date: formData.due_date || undefined,
    })

    // Reset form
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      due_date: "",
    })
    setErrors({})
  }

  const handleChange = (field: keyof CreateTodoDTO, value: string) => {
    setFormData({ ...formData, [field]: value })

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  return (
    <div className="todo-form">
      <div className="todo-form-card ">
        <div className="card-header mb-3">
          <h3 className="mb-0">
            Create New Todo
          </h3>
          <button className="close-btn" onClick={onCancel}>
            &times;
          </button>
        </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.title ? "is-invalid" : ""}`}
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="What needs to be done?"
              />
              {errors.title && <div className="invalid-feedback">{errors.title}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="priority" className="form-label">
                Priority
              </label>
              <select
                className="form-select"
                id="priority"
                value={formData.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
              </select>
            </div>
          
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                className="form-control"
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Add more details about this todo..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="due_date" className="form-label">
                Due Date
              </label>
              <input
                type="date"
                className={`form-control ${errors.due_date ? "is-invalid" : ""}`}
                id="due_date"
                value={formData.due_date}
                onChange={(e) => handleChange("due_date", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
              {errors.due_date && <div className="invalid-feedback">{errors.due_date}</div>}
            </div>
          

            <div className="form-actions d-flex gap-2">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create
              </button>
            </div>
        </form>
      </div>
      </div>
    </div>
  )
}
