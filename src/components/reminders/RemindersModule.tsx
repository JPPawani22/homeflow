"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { auth } from "@/lib/firebase"
import type { Reminder, CreateReminderDTO } from "@/types"

interface RemindersModuleProps {
  compact?: boolean
}

export default function RemindersModule({ compact = false }: RemindersModuleProps) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<CreateReminderDTO>({
    title: "",
    description: "",
    reminder_date: "",
    priority: "medium",
    reminder_type: "reminder",
  })

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()
      const response = await fetch("/api/reminders", {
        headers: {
          Authorization: `Bearer ${user.uid}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setReminders(data)
      }
    } catch (error) {
      console.error("Error fetching reminders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const user = auth.currentUser
      if (!user) return

      const formattedData = {
        ...formData,
        reminder_date: new Date(formData.reminder_date).toISOString()
      }

      const token = await user.getIdToken()
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.uid}`,
        },
        body: JSON.stringify(formattedData),
      })

      if (response.ok) {
        setFormData({
          title: "",
          description: "",
          reminder_date: "",
          priority: "medium",
          reminder_type: "reminder",
        })
        setShowForm(false)
        fetchReminders()
      }
    } catch (error) {
      console.error("Error creating reminder:", error)
    }
  }

  const toggleComplete = async (reminder: Reminder) => {
    try {
      const user = auth.currentUser
      if (!user) return

      const formattedReminder = {
        ...reminder,
        reminder_date: new Date(reminder.reminder_date).toISOString()
      }

      const token = await user.getIdToken()
      const response = await fetch(`/api/reminders/${reminder.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.uid}`,
        },
        body: JSON.stringify({
          ...formattedReminder,
          is_completed: !reminder.is_completed,
        }),
      })

      if (response.ok) {
        fetchReminders()
      }
    } catch (error) {
      console.error("Error updating reminder:", error)
    }
  }

  const deleteReminder = async (id: number) => {
    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()
      const response = await fetch(`/api/reminders/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.uid}`,
        },
      })

      if (response.ok) {
        fetchReminders()
      }
    } catch (error) {
      console.error("Error deleting reminder:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getPriorityBadge = (priority: string) => {
    const badges = {
      high: "badge bg-danger",
      medium: "badge bg-warning",
      low: "badge bg-success",
    }
    return badges[priority as keyof typeof badges] || "badge bg-secondary"
  }

  // Sort reminders with completed ones at the end, then by date
  const sortedReminders = [...reminders].sort((a, b) => {
    // Completed items go to the bottom
    if (a.is_completed && !b.is_completed) return 1
    if (!a.is_completed && b.is_completed) return -1
    
    // Then sort by date (earlier dates first)
    return new Date(a.reminder_date).getTime() - new Date(b.reminder_date).getTime()
  })

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`reminders-module ${compact ? "compact-view" : ""}`}>
      {!compact && (
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button 
            className="btn btn-primary" 
            onClick={() => setShowForm(!showForm)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Add Reminder
          </button>
        </div>
      )}

      {showForm && !compact && (
        <div className="reminder-form-card card">
          <div className="card-header">
            <h5 className="mb-0">Create New Reminder</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="title" className="form-label">
                    Title
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="reminder_date" className="form-label">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    id="reminder_date"
                    value={formData.reminder_date}
                    onChange={(e) => setFormData({ ...formData, reminder_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="priority" className="form-label">
                    Priority
                  </label>
                  <select
                    className="form-select"
                    id="priority"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as "low" | "medium" | "high" })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="reminder_type" className="form-label">
                    Type
                  </label>
                  <select
                    className="form-select"
                    id="reminder_type"
                    value={formData.reminder_type}
                    onChange={(e) =>
                      setFormData({ ...formData, reminder_type: e.target.value as "reminder" | "event" })
                    }
                  >
                    <option value="reminder">Reminder</option>
                    <option value="event">Event</option>
                  </select>
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
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="reminder-list card">
        <div className="card-body">
          {sortedReminders.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-bell"></i>
              <h5>No reminders yet</h5>
              {!compact && <p>Create your first reminder to get started</p>}
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {sortedReminders
                .filter(reminder => compact ? !reminder.is_completed : true)
                .slice(0, compact ? 3 : undefined)
                .map((reminder) => (
                  <div 
                    key={reminder.id} 
                    className={`list-group-item priority-${reminder.priority} ${reminder.is_completed ? 'completed-reminder' : ''}`}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          {!compact && (
                            <input
                              type="checkbox"
                              className="form-check-input me-3"
                              checked={reminder.is_completed}
                              onChange={() => toggleComplete(reminder)}
                            />
                          )}
                          <h6
                            className={`mb-0 ${reminder.is_completed ? "text-decoration-line-through text-muted" : ""}`}
                          >
                            {reminder.title}
                          </h6>
                          <span className={`ms-2 ${getPriorityBadge(reminder.priority)}`}>
                            {reminder.priority}
                          </span>
                          {!compact && (
                            <span className="badge bg-info ms-2">
                              {reminder.reminder_type}
                            </span>
                          )}
                        </div>
                        {!compact && reminder.description && (
                          <p className="mb-2 text-muted">{reminder.description}</p>
                        )}
                        <small className="text-muted">
                          <i className="bi bi-calendar3 me-1"></i>
                          {formatDate(reminder.reminder_date)}
                        </small>
                      </div>
                      {!compact && (
                        <button 
                          className="btn btn-outline-danger btn-sm" 
                          onClick={() => deleteReminder(reminder.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}