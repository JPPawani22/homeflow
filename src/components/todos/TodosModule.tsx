"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { auth } from "@/lib/firebase"
import type { Todo, CreateTodoDTO } from "@/types"
import TodoItem from "./TodoItem"
import TodoForm from "./TodoForm"
import TodoFilters from "./TodoFilters"

interface TodosModuleProps {
  compact?: boolean
}

export default function TodosModule({ compact = false }: TodosModuleProps) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "high" | "medium" | "low">("all")
  const [draggedItem, setDraggedItem] = useState<Todo | null>(null)

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()
      const response = await fetch("/api/todos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTodos(data)
      }
    } catch (error) {
      console.error("Error fetching todos:", error)
    } finally {
      setLoading(false)
    }
  }

  const createTodo = async (todoData: CreateTodoDTO) => {
    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(todoData),
      })

      if (response.ok) {
        fetchTodos()
        setShowForm(false)
      }
    } catch (error) {
      console.error("Error creating todo:", error)
    }
  }

  const updateTodo = async (id: number, updates: Partial<Todo>) => {
    try {
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

      if (response.ok) {
        fetchTodos()
      }
    } catch (error) {
      console.error("Error updating todo:", error)
    }
  }

  const deleteTodo = async (id: number) => {
    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchTodos()
      }
    } catch (error) {
      console.error("Error deleting todo:", error)
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

  const filteredTodos = getFilteredTodos()
  const stats = getStats()

  if (compact) {
    const recentTodos = todos.filter((t) => !t.is_completed).slice(0, 3)
    return (
      <div>
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
      {/* Header with Stats */}
      <div className="row mb-4">
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

      {/* Todo Form */}
      {showForm && <TodoForm onSubmit={createTodo} onCancel={() => setShowForm(false)} />}

      {/* Filters */}
      <TodoFilters currentFilter={filter} onFilterChange={setFilter} stats={stats} />

      {/* Todo List */}
      <div className="homeflow-card card">
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
