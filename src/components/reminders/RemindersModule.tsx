"use client"

import React, { useState, useEffect } from "react"
import { auth } from "@/lib/firebase"
import type { Reminder, CreateReminderDTO } from "@/types"
import { motion, AnimatePresence } from "framer-motion"

interface RemindersModuleProps {
  compact?: boolean
}

export default function RemindersModule({ compact = false }: RemindersModuleProps) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [formData, setFormData] = useState<CreateReminderDTO>({
    title: "",
    description: "",
    reminder_date: new Date().toISOString().slice(0, 16), // Set current date/time as default
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

      const url = editingReminder 
        ? `/api/reminders/${editingReminder.id}`
        : "/api/reminders"

      const method = editingReminder ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
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
      console.error("Error creating/updating reminder:", error)
    }
  }

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setFormData({
      title: reminder.title,
      description: reminder.description || "",
      reminder_date: reminder.reminder_date.slice(0, 16),
      priority: reminder.priority,
      reminder_type: reminder.reminder_type,
    })
    setShowForm(true)
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
      reminder_date: new Date().toISOString().slice(0, 16), // Reset to current date/time
      priority: "medium",
      reminder_type: "reminder",
    })
    setEditingReminder(null)
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

  // Separate completed and active reminders
  const activeReminders = reminders.filter(r => !r.is_completed)
  const completedReminders = reminders.filter(r => r.is_completed)

  // Sort active reminders by priority and date
  const sortedActiveReminders = [...activeReminders].sort((a, b) => {
    const priorityOrder = { high: 1, medium: 2, low: 3 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return new Date(a.reminder_date).getTime() - new Date(b.reminder_date).getTime()
  })

  // Filter active reminders by priority
  const highPriority = sortedActiveReminders.filter(r => r.priority === "high")
  const mediumPriority = sortedActiveReminders.filter(r => r.priority === "medium")
  const lowPriority = sortedActiveReminders.filter(r => r.priority === "low")

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
        <div className="reminders-layout">
          {/* Floating Add Button */}
          <motion.button
            className="floating-add-btn btn btn-primary"
            onClick={() => setShowForm(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <i className="bi bi-plus-circle"></i> Add Reminder
          </motion.button>

          <div className="reminders-column">
            <motion.div 
              className="priority-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="section-title priority-high">
                <i className="bi bi-exclamation-triangle-fill"></i> High Priority
              </h4>
              <div className="priority-list">
                {highPriority.length === 0 ? (
                  <div className="empty-priority">No high priority reminders</div>
                ) : (
                  highPriority.map((reminder, index) => (
                    <PriorityReminderItem 
                      key={reminder.id}
                      reminder={reminder}
                      onEdit={handleEdit}
                      onDelete={deleteReminder}
                      onToggleComplete={toggleComplete}
                      index={index}
                    />
                  ))
                )}
              </div>
            </motion.div>

            <motion.div 
              className="priority-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h4 className="section-title priority-medium">
                <i className="bi bi-exclamation-circle-fill"></i> Medium Priority
              </h4>
              <div className="priority-list">
                {mediumPriority.length === 0 ? (
                  <div className="empty-priority">No medium priority reminders</div>
                ) : (
                  mediumPriority.map((reminder, index) => (
                    <PriorityReminderItem 
                      key={reminder.id}
                      reminder={reminder}
                      onEdit={handleEdit}
                      onDelete={deleteReminder}
                      onToggleComplete={toggleComplete}
                      index={index}
                    />
                  ))
                )}
              </div>
            </motion.div>

            <motion.div 
              className="priority-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h4 className="section-title priority-low">
                <i className="bi bi-arrow-down-circle-fill"></i> Low Priority
              </h4>
              <div className="priority-list">
                {lowPriority.length === 0 ? (
                  <div className="empty-priority">No low priority reminders</div>
                ) : (
                  lowPriority.map((reminder, index) => (
                    <PriorityReminderItem 
                      key={reminder.id}
                      reminder={reminder}
                      onEdit={handleEdit}
                      onDelete={deleteReminder}
                      onToggleComplete={toggleComplete}
                      index={index}
                    />
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Previous Reminders Card */}
          {completedReminders.length > 0 && (
            <motion.div 
              className="previous-reminders-card card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className="card-header">
                <h4 className="section-title">
                  <i className="bi bi-check-circle-fill"></i> Previous Reminders
                </h4>
              </div>
              <div className="card-body">
                <div className="previous-reminders-list">
                  {completedReminders.map((reminder, index) => (
                    <motion.div
                      key={reminder.id}
                      className="previous-reminder-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-check-circle text-success me-2"></i>
                          <span className="previous-reminder-title text-muted text-decoration-line-through">
                            {reminder.title}
                          </span>
                        </div>
                        <div className="previous-reminder-date text-muted small">
                          {formatDate(reminder.reminder_date)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {compact && (
        <div className="reminder-list-container">
          {sortedActiveReminders.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-bell"></i>
              <h5>No reminders yet</h5>
            </div>
          ) : (
            <div className="reminder-list">
              {sortedActiveReminders
                .slice(0, 3)
                .map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`reminder-item priority-${reminder.priority}`}
                  >
                    <div className="reminder-header">
                      <div className="d-flex align-items-center">
                        <h5 className="reminder-title mb-0">{reminder.title}</h5>
                      </div>
                      <span className={`priority-badge ${reminder.priority}`}>
                        {reminder.priority}
                      </span>
                    </div>
                    <div className="reminder-footer">
                      <div className="reminder-date">
                        <i className="bi bi-calendar3"></i>
                        {formatDate(reminder.reminder_date)}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div 
            className="reminder-form-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="reminder-form-card card"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="card-header">
                <h3>{editingReminder ? 'Edit Reminder' : 'Create New Reminder'}</h3>
                <button className="close-btn" onClick={resetForm}>
                  &times;
                </button>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <motion.div 
                    className="form-group"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label htmlFor="title">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </motion.div>
                  
                  <motion.div 
                    className="form-group"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <label htmlFor="reminder_date">Date & Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      id="reminder_date"
                      value={formData.reminder_date}
                      onChange={(e) => setFormData({ ...formData, reminder_date: e.target.value })}
                      required
                    />
                  </motion.div>
                  
                  <motion.div 
                    className="row"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
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
                  </motion.div>
                  
                  <motion.div 
                    className="form-group"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <label htmlFor="description">Description</label>
                    <textarea
                      className="form-control"
                      id="description"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </motion.div>
                  
                  <motion.div 
                    className="form-actions"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={resetForm}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button 
                      type="submit" 
                      className="btn btn-primary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {editingReminder ? 'Update' : 'Create'}
                    </motion.button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface PriorityReminderItemProps {
  reminder: Reminder
  onEdit: (reminder: Reminder) => void
  onDelete: (id: number) => void
  onToggleComplete: (reminder: Reminder) => void
  index: number
}

const PriorityReminderItem = ({ 
  reminder, 
  onEdit, 
  onDelete, 
  onToggleComplete,
  index
}: PriorityReminderItemProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <motion.div
      className={`priority-reminder-item ${reminder.is_completed ? 'completed' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      layout
    >
      <div className="d-flex align-items-center">
        <input
          type="checkbox"
          className="form-check-input me-2"
          checked={reminder.is_completed}
          onChange={() => onToggleComplete(reminder)}
        />
        <div className="reminder-content">
          <div className="reminder-title">{reminder.title}</div>
          <div className="reminder-date">
            <i className="bi bi-calendar3"></i>
            {formatDate(reminder.reminder_date)}
          </div>
        </div>
      </div>
      <div className="reminder-actions">
        <motion.button
          className="btn btn-sm btn-outline-secondary me-1"
          onClick={() => onEdit(reminder)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <i className="bi bi-pencil"></i>
        </motion.button>
        <motion.button
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(reminder.id)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <i className="bi bi-trash"></i>
        </motion.button>
      </div>
    </motion.div>
  )
}