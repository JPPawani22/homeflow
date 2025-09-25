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
  const [expandedReminder, setExpandedReminder] = useState<number | null>(null)
  const [formData, setFormData] = useState<CreateReminderDTO>({
    title: "",
    description: "",
    reminder_date: new Date().toISOString().slice(0, 16),
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
    setExpandedReminder(null)
  }

  const toggleComplete = async (reminder: Reminder) => {
    try {
      const user = auth.currentUser
      if (!user) return

      const response = await fetch(`/api/reminders/${reminder.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.uid}`,
        },
        body: JSON.stringify({
          ...reminder,
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
        setExpandedReminder(null)
      }
    } catch (error) {
      console.error("Error deleting reminder:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      reminder_date: new Date().toISOString().slice(0, 16),
      priority: "medium",
      reminder_type: "reminder",
    })
    setEditingReminder(null)
    setShowForm(false)
  }

  const toggleExpanded = (id: number) => {
    setExpandedReminder(expandedReminder === id ? null : id)
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return "bi-exclamation-triangle-fill"
      case "medium": return "bi-exclamation-circle-fill"
      case "low": return "bi-arrow-down-circle-fill"
      default: return "bi-bell-fill"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "event": return "bi-calendar-event"
      case "reminder": return "bi-bell"
      default: return "bi-bell"
    }
  }

  // Separate completed and active reminders
  const activeReminders = reminders.filter(r => !r.is_completed)
  const completedReminders = reminders.filter(r => r.is_completed)

  // Get today's reminders
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todaysReminders = activeReminders.filter(reminder => {
    const reminderDate = new Date(reminder.reminder_date)
    reminderDate.setHours(0, 0, 0, 0)
    return reminderDate.getTime() === today.getTime()
  })

  // Get upcoming reminders (next 14 days)
  const fourteenDaysFromNow = new Date(today)
  fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14)

  const upcomingReminders = activeReminders.filter(reminder => {
    const reminderDate = new Date(reminder.reminder_date)
    reminderDate.setHours(0, 0, 0, 0)
    return reminderDate > today && reminderDate <= fourteenDaysFromNow
  })

  // Sort reminders by date
  const sortedTodaysReminders = [...todaysReminders].sort((a, b) => 
    new Date(a.reminder_date).getTime() - new Date(b.reminder_date).getTime()
  )

  const sortedUpcomingReminders = [...upcomingReminders].sort((a, b) => 
    new Date(a.reminder_date).getTime() - new Date(b.reminder_date).getTime()
  )

  const sortedCompletedReminders = [...completedReminders].sort((a, b) => 
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )

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
          {/* Header with current date/time and add button */}
          <div className="reminders-header">
            <div className="current-time-section">
              <h2 className="current-date">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</h2>
              <p className="current-time">{new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}</p>
            </div>
            
            <motion.button
              className="btn btn-primary add-reminder-btn"
              onClick={() => setShowForm(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <i className="bi bi-plus-circle me-2"></i> Add Reminder
            </motion.button>
          </div>

          <div className="reminders-content">
            {/* Today's Reminders */}
            <motion.div 
              className="reminders-section today-reminders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="section-title">
                <i className="bi bi-calendar-day me-2"></i> Today's Reminders
                {sortedTodaysReminders.length > 0 && (
                  <span className="badge bg-primary ms-2">{sortedTodaysReminders.length}</span>
                )}
              </h4>
              
              <div className="reminders-list">
                {sortedTodaysReminders.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-check-circle"></i>
                    <p>No reminders for today</p>
                  </div>
                ) : (
                  sortedTodaysReminders.map((reminder, index) => (
                    <ReminderCard 
                      key={reminder.id}
                      reminder={reminder}
                      onEdit={handleEdit}
                      onDelete={deleteReminder}
                      onToggleComplete={toggleComplete}
                      onToggleExpand={toggleExpanded}
                      isExpanded={expandedReminder === reminder.id}
                      index={index}
                    />
                  ))
                )}
              </div>
            </motion.div>

            {/* Upcoming Reminders */}
            <motion.div 
              className="reminders-section upcoming-reminders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h4 className="section-title">
                <i className="bi bi-calendar-week me-2"></i> Upcoming (Next 14 Days)
                {sortedUpcomingReminders.length > 0 && (
                  <span className="badge bg-info ms-2">{sortedUpcomingReminders.length}</span>
                )}
              </h4>
              
              <div className="reminders-list">
                {sortedUpcomingReminders.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-calendar-plus"></i>
                    <p>No upcoming reminders</p>
                  </div>
                ) : (
                  sortedUpcomingReminders.map((reminder, index) => (
                    <ReminderCard 
                      key={reminder.id}
                      reminder={reminder}
                      onEdit={handleEdit}
                      onDelete={deleteReminder}
                      onToggleComplete={toggleComplete}
                      onToggleExpand={toggleExpanded}
                      isExpanded={expandedReminder === reminder.id}
                      index={index}
                    />
                  ))
                )}
              </div>
            </motion.div>

            {/* Completed Reminders */}
            {sortedCompletedReminders.length > 0 && (
              <motion.div 
                className="reminders-section completed-reminders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h4 className="section-title">
                  <i className="bi bi-check-circle me-2"></i> Completed Reminders
                  <span className="badge bg-success ms-2">{sortedCompletedReminders.length}</span>
                </h4>
                
                <div className="completed-reminders-list">
                  {sortedCompletedReminders.map((reminder, index) => (
                    <CompletedReminderItem 
                      key={reminder.id}
                      reminder={reminder}
                      onToggleComplete={toggleComplete}
                      index={index}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {compact && (
        <div className="reminder-list-container">
          {activeReminders.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-bell"></i>
              <h5>No reminders yet</h5>
            </div>
          ) : (
            <div className="reminder-list">
              {activeReminders
                .slice(0, 3)
                .map((reminder) => (
                  <CompactReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onToggleComplete={toggleComplete}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <ReminderForm 
            formData={formData}
            setFormData={setFormData}
            editingReminder={editingReminder}
            onSubmit={handleSubmit}
            onClose={resetForm}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface ReminderCardProps {
  reminder: Reminder
  onEdit: (reminder: Reminder) => void
  onDelete: (id: number) => void
  onToggleComplete: (reminder: Reminder) => void
  onToggleExpand: (id: number) => void
  isExpanded: boolean
  index: number
}

const ReminderCard = ({ 
  reminder, 
  onEdit, 
  onDelete, 
  onToggleComplete,
  onToggleExpand,
  isExpanded,
  index
}: ReminderCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return "bi-exclamation-triangle-fill"
      case "medium": return "bi-exclamation-circle-fill"
      case "low": return "bi-arrow-down-circle-fill"
      default: return "bi-bell-fill"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "event": return "bi-calendar-event"
      case "reminder": return "bi-bell"
      default: return "bi-bell"
    }
  }

  return (
    <motion.div
      className={`reminder-card card ${isExpanded ? 'expanded' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      layout
    >
      <div className="card-body">
        <div className="reminder-header">
          <div className="d-flex align-items-center">
            <motion.input
              type="checkbox"
              className="form-check-input me-3"
              checked={reminder.is_completed}
              onChange={() => onToggleComplete(reminder)}
              whileTap={{ scale: 0.9 }}
            />
            <div 
              className="reminder-content flex-grow-1"
              onClick={() => onToggleExpand(reminder.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="reminder-title mb-1">{reminder.title}</h5>
                  <div className="reminder-meta">
                    <span className="reminder-date me-3">
                      <i className="bi bi-clock me-1"></i>
                      {formatTime(reminder.reminder_date)}
                    </span>
                    <span className={`priority-badge ${reminder.priority}`}>
                      <i className={`bi ${getPriorityIcon(reminder.priority)} me-1`}></i>
                      {reminder.priority}
                    </span>
                  </div>
                </div>
                <motion.button
                  className="btn btn-sm btn-outline-secondary expand-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleExpand(reminder.id)
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="reminder-details"
            >
              <div className="details-content mt-3 pt-3 border-top">
                {reminder.description && (
                  <div className="reminder-description mb-3">
                    <p className="text-muted">{reminder.description}</p>
                  </div>
                )}
                
                <div className="reminder-info-grid">
                  <div className="info-item">
                    <i className="bi bi-calendar3 me-2"></i>
                    <span>Date: {formatDate(reminder.reminder_date)}</span>
                  </div>
                  <div className="info-item">
                    <i className={`bi ${getTypeIcon(reminder.reminder_type)} me-2`}></i>
                    <span>Type: {reminder.reminder_type}</span>
                  </div>
                  <div className="info-item">
                    <i className="bi bi-calendar-check me-2"></i>
                    <span>Created: {formatDate(reminder.created_at)}</span>
                  </div>
                </div>

                <div className="reminder-actions mt-3">
                  <motion.button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => onEdit(reminder)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <i className="bi bi-pencil me-1"></i> Edit
                  </motion.button>
                  <motion.button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => onDelete(reminder.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <i className="bi bi-trash me-1"></i> Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

interface CompletedReminderItemProps {
  reminder: Reminder
  onToggleComplete: (reminder: Reminder) => void
  index: number
}

const CompletedReminderItem = ({ reminder, onToggleComplete, index }: CompletedReminderItemProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <motion.div
      className="completed-reminder-item"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <motion.input
            type="checkbox"
            className="form-check-input me-2"
            checked={reminder.is_completed}
            onChange={() => onToggleComplete(reminder)}
            whileTap={{ scale: 0.9 }}
          />
          <div>
            <span className="completed-reminder-title text-muted text-decoration-line-through">
              {reminder.title}
            </span>
            <div className="completed-reminder-date text-muted small">
              Completed on {formatDate(reminder.updated_at)}
            </div>
          </div>
        </div>
        <div className="text-muted small">
          {formatDate(reminder.reminder_date)}
        </div>
      </div>
    </motion.div>
  )
}

interface CompactReminderCardProps {
  reminder: Reminder
  onToggleComplete: (reminder: Reminder) => void
}

const CompactReminderCard = ({ reminder, onToggleComplete }: CompactReminderCardProps) => {
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
    <div className={`compact-reminder-card ${reminder.priority}`}>
      <div className="d-flex align-items-center">
        <input
          type="checkbox"
          className="form-check-input me-2"
          checked={reminder.is_completed}
          onChange={() => onToggleComplete(reminder)}
        />
        <div className="flex-grow-1">
          <h6 className="mb-0">{reminder.title}</h6>
          <small className="text-muted">{formatDate(reminder.reminder_date)}</small>
        </div>
        <span className={`priority-dot ${reminder.priority}`}></span>
      </div>
    </div>
  )
}

interface ReminderFormProps {
  formData: CreateReminderDTO
  setFormData: (data: CreateReminderDTO) => void
  editingReminder: Reminder | null
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

const ReminderForm = ({ formData, setFormData, editingReminder, onSubmit, onClose }: ReminderFormProps) => {
  return (
    <motion.div 
      className="reminder-form-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div 
        className="reminder-form-container"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="reminder-form-card">
          <div className="card-header">
            <h3>{editingReminder ? 'Edit Reminder' : 'Create New Reminder'}</h3>
            <button className="close-btn" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={onSubmit}>
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
              
              <div className="form-row">
                <div className="form-group">
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
                <div className="form-group">
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
                  placeholder="Add a description (optional)"
                />
              </div>
              
              <div className="form-actions">
                <motion.button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={onClose}
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
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}