"use client"

import React, { useState, useEffect } from "react"
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

      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.uid}`,
        },
        body: JSON.stringify(formattedData),
      })

      if (response.ok) {
        resetForm()
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

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      reminder_date: "",
      priority: "medium",
      reminder_type: "reminder",
    })
    setShowForm(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Sort reminders with completed ones at the end, then by date
  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.is_completed && !b.is_completed) return 1
    if (!a.is_completed && b.is_completed) return -1
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
        <button
          className="add-reminder-btn btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <i className="bi bi-plus-circle"></i>
          Add Reminder
        </button>
      )}

      <div className="reminder-list-container">
        {sortedReminders.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-bell"></i>
            <h5>No reminders yet</h5>
            {!compact && <p>Add your first reminder to get started</p>}
          </div>
        ) : (
          <div className="reminder-list">
            {sortedReminders
              .filter(reminder => compact ? !reminder.is_completed : true)
              .slice(0, compact ? 3 : undefined)
              .map((reminder) => (
                <div
                  key={reminder.id}
                  className={`reminder-item priority-${reminder.priority} ${reminder.is_completed ? 'completed-reminder' : ''}`}
                >
                  <div className="reminder-header">
                    <div className="d-flex align-items-center">
                      {!compact && (
                        <input
                          type="checkbox"
                          className="form-check-input me-2"
                          checked={reminder.is_completed}
                          onChange={() => toggleComplete(reminder)}
                        />
                      )}
                      <h5 className="reminder-title mb-0">{reminder.title}</h5>
                    </div>
                    <span className={`priority-badge ${reminder.priority}`}>
                      {reminder.priority}
                    </span>
                  </div>
                  
                  {!compact && reminder.description && (
                    <div className="reminder-body">
                      {reminder.description}
                    </div>
                  )}
                  
                  <div className="reminder-footer">
                    <div className="reminder-date">
                      <i className="bi bi-calendar3"></i>
                      {formatDate(reminder.reminder_date)}
                    </div>
                    {!compact && (
                      <div className="reminder-actions">
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => deleteReminder(reminder.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className={`reminder-form-container ${showForm ? 'visible' : ''}`}>
        <div className="reminder-form-card card">
          <div className="card-header">
            <h3>Create New Reminder</h3>
            <button className="close-btn" onClick={() => setShowForm(false)}>
              &times;
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="reminder_date">Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  id="reminder_date"
                  value={formData.reminder_date}
                  onChange={(e) => setFormData({ ...formData, reminder_date: e.target.value })}
                  required
                />
              </div>
              
              <div className="row">
                <div className="col-md-6 form-group">
                  <label htmlFor="priority">Priority</label>
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
                <div className="col-md-6 form-group">
                  <label htmlFor="reminder_type">Type</label>
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
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
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
    </div>
  )
}