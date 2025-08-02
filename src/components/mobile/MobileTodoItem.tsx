"use client"

import { useState } from "react"
import type { Todo } from "@/types"

interface MobileTodoItemProps {
  todo: Todo
  onToggleComplete: (id: number) => void
  onChangePriority: (id: number, priority: "low" | "medium" | "high") => void
  onDelete: (id: number) => void
  onUpdate: (id: number, updates: Partial<Todo>) => void
}

export default function MobileTodoItem({
  todo,
  onToggleComplete,
  onChangePriority,
  onDelete,
  onUpdate,
}: MobileTodoItemProps) {
  const [showActions, setShowActions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)

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
      })
    }
  }

  const handleSaveEdit = () => {
    onUpdate(todo.id, { title: editTitle })
    setIsEditing(false)
  }

  return (
    <div className={`mobile-todo-item d-mobile-only priority-${todo.priority}`}>
      <div className="todo-header">
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            checked={todo.is_completed}
            onChange={() => onToggleComplete(todo.id)}
          />
        </div>

        <div className="todo-content">
          {isEditing ? (
            <div>
              <input
                type="text"
                className="form-control form-control-sm mb-2"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
                autoFocus
              />
            </div>
          ) : (
            <>
              <div className={`todo-title ${todo.is_completed ? "completed" : ""}`}>{todo.title}</div>
              {todo.description && <div className="todo-description">{todo.description}</div>}
            </>
          )}
        </div>
      </div>

      <div className="todo-meta">
        <span className={`badge bg-${getPriorityColor(todo.priority)}`}>{todo.priority}</span>

        {todo.due_date && (
          <span className="badge bg-info">
            <i className="bi bi-calendar3 me-1"></i>
            {formatDueDate(todo.due_date)}
          </span>
        )}

        <small className="text-muted">{new Date(todo.created_at).toLocaleDateString()}</small>

        <button className="btn btn-link p-0 text-muted ms-auto" onClick={() => setShowActions(!showActions)}>
          <i className="bi bi-three-dots"></i>
        </button>
      </div>

      {showActions && (
        <div className="todo-actions">
          <button
            className="btn btn-outline-primary"
            onClick={() => {
              setIsEditing(true)
              setShowActions(false)
            }}
          >
            <i className="bi bi-pencil me-1"></i>
            Edit
          </button>

          <div className="dropdown">
            <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              Priority
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

          <button
            className="btn btn-outline-danger"
            onClick={() => {
              if (window.confirm("Delete this todo?")) {
                onDelete(todo.id)
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
