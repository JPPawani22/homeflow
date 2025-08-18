"use client"

import type React from "react"
import { useState } from "react"
import type { Todo } from "@/types"

interface TodoItemProps {
  todo: Todo
  onToggleComplete: (id: number) => void
  onChangePriority: (id: number, priority: "low" | "medium" | "high") => void
  onDelete: (id: number) => void
  onUpdate: (id: number, updates: Partial<Todo>) => void
  onDragStart: (e: React.DragEvent, todo: Todo) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, todo: Todo) => void
  isDragging: boolean
}

export default function TodoItem({
  todo,
  onToggleComplete,
  onChangePriority,
  onDelete,
  onUpdate,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [editDescription, setEditDescription] = useState(todo.description || "")
  const [editDueDate, setEditDueDate] = useState(todo.due_date || "")

  const handleSaveEdit = () => {
    onUpdate(todo.id, {
      title: editTitle,
      description: editDescription || undefined,
      due_date: editDueDate || undefined,
    })
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditTitle(todo.title)
    setEditDescription(todo.description || "")
    setEditDueDate(todo.due_date || "")
    setIsEditing(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "danger"
      case "medium":
        return "warning"
      case "low":
        return "success"
      default:
        return "secondary"
    }
  }

  const isOverdue = () => {
    if (!todo.due_date) return false
    return new Date(todo.due_date) < new Date() && !todo.is_completed
  }

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      })
    }
  }

  return (
    <div
      className={`todo-item border rounded mb-3 p-3 ${isDragging ? "opacity-50" : ""} ${
        todo.is_completed ? "bg-light" : ""
      } priority-${todo.priority}`}
      draggable
      onDragStart={(e) => onDragStart(e, todo)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, todo)}
      style={{ cursor: "grab" }}
    >
      <div className="d-flex align-items-start">
        {/* Drag Handle */}
        <div className="drag-handle me-2 text-muted" style={{ cursor: "grab" }}>
          <i className="bi bi-grip-vertical"></i>
        </div>

        {/* Checkbox */}
        <div className="form-check me-3">
          <input
            type="checkbox"
            className="form-check-input"
            checked={todo.is_completed}
            onChange={() => onToggleComplete(todo.id)}
          />
        </div>

        {/* Content */}
        <div className="flex-grow-1">
          {isEditing ? (
            <div className="edit-form">
              <div className="mb-2">
                <input
                  type="text"
                  className="form-control"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Todo title"
                />
              </div>
              <div className="mb-2">
                <textarea
                  className="form-control"
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description (optional)"
                />
              </div>
              <div className="mb-2">
                <input
                  type="date"
                  className="form-control"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-primary" onClick={handleSaveEdit}>
                  Save
                </button>
                <button className="btn btn-sm btn-secondary" onClick={handleCancelEdit}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h6 className={`mb-1 ${todo.is_completed ? "text-decoration-line-through text-muted" : ""}`}>
                {todo.title}
              </h6>
              {todo.description && (
                <p className={`mb-2 small ${todo.is_completed ? "text-muted" : ""}`}>{todo.description}</p>
              )}
              <div className="d-flex align-items-center gap-1 flex-wrap">
                {/* Priority Badge */}
                <div className="dropdown">
                  <button
                    className={`btn btn-sm btn-outline-${getPriorityColor(todo.priority)} dropdown-toggle`}
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {todo.priority}
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <button className="dropdown-item" onClick={() => onChangePriority(todo.id, "high")}>
                        <span className="badge bg-danger me-2">High</span>
                        High Priority
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={() => onChangePriority(todo.id, "medium")}>
                        <span className="badge bg-warning me-2">Medium</span>
                        Medium Priority
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={() => onChangePriority(todo.id, "low")}>
                        <span className="badge bg-success me-2">Low</span>
                        Low Priority
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Due Date */}
                {todo.due_date && (
                  <span
                    className={`badge ${
                      isOverdue()
                        ? "bg-danger"
                        : new Date(todo.due_date).toDateString() === new Date().toDateString()
                          ? "bg-warning"
                          : "bg-info"
                    }`}
                  >
                    <i className="bi bi-calendar3 me-1"></i>
                    {formatDueDate(todo.due_date)}
                  </span>
                )}

                {/* Created Date */}
                <small className="text-muted">Created {new Date(todo.created_at).toLocaleDateString()}</small>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="dropdown">
            <button
              className="btn btn-sm btn-outline-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-three-dots"></i>
            </button>
            <ul className="dropdown-menu">
              <li>
                <button className="dropdown-item" onClick={() => setIsEditing(true)}>
                  <i className="bi bi-pencil me-2"></i>
                  Edit
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={() => onToggleComplete(todo.id)}>
                  <i className={`bi ${todo.is_completed ? "bi-arrow-counterclockwise" : "bi-check"} me-2`}></i>
                  {todo.is_completed ? "Mark Incomplete" : "Mark Complete"}
                </button>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button className="dropdown-item text-danger" onClick={() => onDelete(todo.id)}>
                  <i className="bi bi-trash me-2"></i>
                  Delete
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
