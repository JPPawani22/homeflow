"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { auth } from "@/lib/firebase"
import type { Todo, CreateTodoDTO } from "@/types"
import TodoItem from "./TodoItem"
import TodoForm from "./TodoForm"
import TodoFilters from "./TodoFilters"

// Add mobile imports at the top
import MobileStatsGrid from "@/components/mobile/MobileStatsGrid"
import MobileTodoItem from "@/components/mobile/MobileTodoItem"
import MobileBottomSheet from "@/components/mobile/MobileBottomSheet"

interface TodosModuleProps {
  compact?: boolean
}

export default function TodosModule({ compact = false }: TodosModuleProps) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "high" | "medium" | "low">("all")
  const [draggedItem, setDraggedItem] = useState<Todo | null>(null)

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      setError(null)
      const user = auth.currentUser
      if (!user) {
        setError("Please sign in to view your todos")
        setLoading(false)
        return
      }

      const token = await user.getIdToken()
      const response = await fetch("/api/todos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setTodos(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching todos:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch todos")
    } finally {
      setLoading(false)
    }
  }

  const createTodo = async (todoData: CreateTodoDTO) => {
    try {
      setError(null)
      const user = auth.currentUser
      if (!user) {
        setError("Please sign in to create todos")
        return
      }

      const token = await user.getIdToken()
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(todoData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to create todo")
      }

      await fetchTodos()
      setShowForm(false)
    } catch (error) {
      console.error("Error creating todo:", error)
      setError(error instanceof Error ? error.message : "Failed to create todo")
    }
  }

  const updateTodo = async (id: number, updates: Partial<Todo>) => {
    try {
      setError(null)
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()
      const todo = todos.find((t) => t.id === id)
      if (!todo) return

      const response = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...todo, ...updates }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update todo")
      }

      await fetchTodos()
    } catch (error) {
      console.error("Error updating todo:", error)
      setError(error instanceof Error ? error.message : "Failed to update todo")
    }
  }

  const deleteTodo = async (id: number) => {
    try {
      setError(null)
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete todo")
      }

      await fetchTodos()
    } catch (error) {
      console.error("Error deleting todo:", error)
      setError(error instanceof Error ? error.message : "Failed to delete todo")
    }
  }

  const toggleComplete = (id: number) => {
    const todo = todos.find((t) => t.id === id)
    if (todo) {
      updateTodo(id, { is_completed: !todo.is_completed })
    }
  }

  const changePriority = (id: number, priority: "low" | "medium" | "high") => {
    updateTodo(id, { priority })
  }

  const handleDragStart = (e: React.DragEvent, todo: Todo) => {
    setDraggedItem(todo)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetTodo: Todo) => {
    e.preventDefault()

    if (!draggedItem || draggedItem.id === targetTodo.id) {
      setDraggedItem(null)
      return
    }

    // Reorder todos based on drag and drop
    const draggedIndex = todos.findIndex((t) => t.id === draggedItem.id)
    const targetIndex = todos.findIndex((t) => t.id === targetTodo.id)

    const newTodos = [...todos]
    const [removed] = newTodos.splice(draggedIndex, 1)
    newTodos.splice(targetIndex, 0, removed)

    setTodos(newTodos)
    setDraggedItem(null)
  }

  const getFilteredTodos = () => {
    let filtered = todos

    switch (filter) {
      case "pending":
        filtered = todos.filter((todo) => !todo.is_completed)
        break
      case "completed":
        filtered = todos.filter((todo) => todo.is_completed)
        break
      case "high":
      case "medium":
      case "low":
        filtered = todos.filter((todo) => todo.priority === filter)
        break
      default:
        filtered = todos
    }

    return filtered
  }

  const getStats = () => {
    const total = todos.length
    const completed = todos.filter((t) => t.is_completed).length
    const pending = total - completed
    const highPriority = todos.filter((t) => t.priority === "high" && !t.is_completed).length

    return { total, completed, pending, highPriority }
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

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error Loading Todos</h4>
        <p>{error}</p>
        <hr />
        <div className="d-flex gap-2">
          <button className="btn btn-outline-danger" onClick={fetchTodos}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Retry
          </button>
          <button className="btn btn-outline-secondary" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      </div>
    )
  }

  const filteredTodos = getFilteredTodos()
  const stats = getStats()

  // Rest of your component remains the same...
  if (compact) {
    const recentTodos = todos.filter((t) => !t.is_completed).slice(0, 3)
    return (
      <div>
        {/* Mobile Stats Grid */}
        <div className="d-mobile-only mb-3">
          <MobileStatsGrid
            stats={[
              { label: "Total", value: stats.total, color: "primary", icon: "bi-list-ul" },
              { label: "Pending", value: stats.pending, color: "warning", icon: "bi-clock" },
              { label: "Done", value: stats.completed, color: "success", icon: "bi-check-circle" },
              { label: "High", value: stats.highPriority, color: "danger", icon: "bi-exclamation-triangle" },
            ]}
          />
        </div>

        {/* Desktop compact view */}
        <div className="d-mobile-none">
          {recentTodos.length === 0 ? (
            <p className="text-muted">No pending todos</p>
          ) : (
            <div className="list-group list-group-flush">
              {recentTodos.map((todo) => (
                <div key={todo.id} className="list-group-item border-0 px-0">
                  <div className="d-flex align-items-center">
                    <input
                      type="checkbox"
                      className="form-check-input me-3"
                      checked={todo.is_completed}
                      onChange={() => toggleComplete(todo.id)}
                    />
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{todo.title}</h6>
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className={`badge bg-${todo.priority === "high" ? "danger" : todo.priority === "medium" ? "warning" : "success"}`}
                        >
                          {todo.priority}
                        </span>
                        {todo.due_date && (
                          <small className="text-muted">Due: {new Date(todo.due_date).toLocaleDateString()}</small>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile compact view */}
        <div className="d-mobile-only">
          {recentTodos.length === 0 ? (
            <p className="text-muted">No pending todos</p>
          ) : (
            <div>
              {recentTodos.map((todo) => (
                <MobileTodoItem
                  key={todo.id}
                  todo={todo}
                  onToggleComplete={toggleComplete}
                  onChangePriority={changePriority}
                  onDelete={deleteTodo}
                  onUpdate={updateTodo}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-3">
          <small className="text-muted">
            {stats.pending} pending • {stats.completed} completed
          </small>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header with Stats - Desktop */}
      <div className="row mb-4 d-mobile-none">
        <div className="col-md-8">
          <div className="d-flex justify-content-between align-items-center">
            <h3>Todo Lists</h3>
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              <i className="bi bi-plus-circle me-2"></i>
              Add Todo
            </button>
          </div>
        </div>
        <div className="col-md-4">
          <div className="row text-center">
            <div className="col-3">
              <div className="homeflow-card card border-primary">
                <div className="card-body p-2">
                  <h5 className="text-primary mb-0">{stats.total}</h5>
                  <small className="text-muted">Total</small>
                </div>
              </div>
            </div>
            <div className="col-3">
              <div className="homeflow-card card border-warning">
                <div className="card-body p-2">
                  <h5 className="text-warning mb-0">{stats.pending}</h5>
                  <small className="text-muted">Pending</small>
                </div>
              </div>
            </div>
            <div className="col-3">
              <div className="homeflow-card card border-success">
                <div className="card-body p-2">
                  <h5 className="text-success mb-0">{stats.completed}</h5>
                  <small className="text-muted">Done</small>
                </div>
              </div>
            </div>
            <div className="col-3">
              <div className="homeflow-card card border-danger">
                <div className="card-body p-2">
                  <h5 className="text-danger mb-0">{stats.highPriority}</h5>
                  <small className="text-muted">High</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Stats Grid */}
      <div className="d-mobile-only mb-3">
        <MobileStatsGrid
          stats={[
            { label: "Total", value: stats.total, color: "primary", icon: "bi-list-ul" },
            { label: "Pending", value: stats.pending, color: "warning", icon: "bi-clock" },
            { label: "Done", value: stats.completed, color: "success", icon: "bi-check-circle" },
            { label: "High", value: stats.highPriority, color: "danger", icon: "bi-exclamation-triangle" },
          ]}
        />
      </div>

      {/* Mobile FAB */}
      <button className="mobile-fab d-mobile-only" onClick={() => setShowForm(true)}>
        <i className="bi bi-plus"></i>
      </button>

      {/* Todo Form - Desktop */}
      <div className="d-mobile-none">
        {showForm && <TodoForm onSubmit={createTodo} onCancel={() => setShowForm(false)} />}
      </div>

      {/* Todo Form - Mobile Bottom Sheet */}
      <MobileBottomSheet isOpen={showForm} onClose={() => setShowForm(false)} title="Add New Todo">
        <TodoForm onSubmit={createTodo} onCancel={() => setShowForm(false)} />
      </MobileBottomSheet>

      {/* Filters - Desktop */}
      <div className="d-mobile-none">
        <TodoFilters currentFilter={filter} onFilterChange={setFilter} stats={stats} />
      </div>

      {/* Filters - Mobile */}
      <div className="d-mobile-only mb-3">
        <div className="btn-group-mobile-horizontal">
          <button
            className={`btn ${filter === "all" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setFilter("all")}
          >
            All ({stats.total})
          </button>
          <button
            className={`btn ${filter === "pending" ? "btn-warning" : "btn-outline-warning"}`}
            onClick={() => setFilter("pending")}
          >
            Pending ({stats.pending})
          </button>
          <button
            className={`btn ${filter === "completed" ? "btn-success" : "btn-outline-success"}`}
            onClick={() => setFilter("completed")}
          >
            Done ({stats.completed})
          </button>
        </div>
      </div>

      {/* Todo List - Desktop */}
      <div className="homeflow-card card d-mobile-none">
        <div className="card-body">
          {filteredTodos.length === 0 ? (
            <div className="text-center p-4">
              <i className="bi bi-check-square display-4 text-muted"></i>
              <h5 className="mt-3">{filter === "all" ? "No todos yet" : `No ${filter} todos`}</h5>
              <p className="text-muted">
                {filter === "all"
                  ? "Create your first todo to get started"
                  : `Try changing the filter to see other todos`}
              </p>
            </div>
          ) : (
            <div className="todo-list">
              {filteredTodos.map((todo, index) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggleComplete={toggleComplete}
                  onChangePriority={changePriority}
                  onDelete={deleteTodo}
                  onUpdate={updateTodo}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  isDragging={draggedItem?.id === todo.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Todo List - Mobile */}
      <div className="d-mobile-only">
        {filteredTodos.length === 0 ? (
          <div className="mobile-empty-state">
            <div className="empty-icon">
              <i className="bi bi-check-square"></i>
            </div>
            <div className="empty-title">{filter === "all" ? "No todos yet" : `No ${filter} todos`}</div>
            <div className="empty-description">
              {filter === "all"
                ? "Create your first todo to get started"
                : `Try changing the filter to see other todos`}
            </div>
            {filter === "all" && (
              <div className="empty-action">
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Your First Todo
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {filteredTodos.map((todo) => (
              <MobileTodoItem
                key={todo.id}
                todo={todo}
                onToggleComplete={toggleComplete}
                onChangePriority={changePriority}
                onDelete={deleteTodo}
                onUpdate={updateTodo}
              />
            ))}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {todos.length > 0 && (
        <div className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted">Overall Progress</span>
            <span className="text-muted">
              {stats.completed} of {stats.total} completed ({Math.round((stats.completed / stats.total) * 100)}%)
            </span>
          </div>
          <div className="progress" style={{ height: "8px" }}>
            <div
              className="progress-bar bg-success"
              role="progressbar"
              style={{ width: `${(stats.completed / stats.total) * 100}%` }}
              aria-valuenow={stats.completed}
              aria-valuemin={0}
              aria-valuemax={stats.total}
            />
          </div>
        </div>
      )}
    </div>
  )
}
