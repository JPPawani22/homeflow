"use client"

import { useState, useEffect } from "react"
import { auth } from "@/lib/firebase"
import type { Reminder } from "@/types"

interface CalendarModuleProps {
  compact?: boolean
}

export default function CalendarModule({ compact = false }: CalendarModuleProps) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

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
          Authorization: `Bearer ${token}`,
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

  const getUpcomingEvents = () => {
    const now = new Date()
    const upcoming = reminders
      .filter((reminder) => new Date(reminder.reminder_date) >= now)
      .sort((a, b) => new Date(a.reminder_date).getTime() - new Date(b.reminder_date).getTime())
      .slice(0, compact ? 3 : 10)

    return upcoming
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

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  const upcomingEvents = getUpcomingEvents()

  if (compact) {
    return (
      <div>
        {upcomingEvents.length === 0 ? (
          <p className="text-muted">No upcoming events</p>
        ) : (
          <div className="list-group list-group-flush">
            {upcomingEvents.map((reminder) => (
              <div key={reminder.id} className="list-group-item border-0 px-0">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">{reminder.title}</h6>
                    <small className="text-muted">{formatDate(reminder.reminder_date)}</small>
                  </div>
                  <span className={getPriorityBadge(reminder.priority)}>{reminder.priority}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="row">
      <div className="col-lg-8">
        <div className="homeflow-card card">
          <div className="card-header">
            <h5 className="mb-0">Calendar View</h5>
          </div>
          <div className="card-body">
            {/* Simple calendar implementation - you can integrate a full calendar library here */}
            <div className="text-center p-4">
              <h4>{currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h4>
              <p className="text-muted">Calendar integration coming soon</p>
              <small>For now, view your upcoming events in the sidebar</small>
            </div>
          </div>
        </div>
      </div>

      <div className="col-lg-4">
        <div className="homeflow-card card">
          <div className="card-header">
            <h5 className="mb-0">Upcoming Events</h5>
          </div>
          <div className="card-body">
            {upcomingEvents.length === 0 ? (
              <p className="text-muted">No upcoming events</p>
            ) : (
              <div className="list-group list-group-flush">
                {upcomingEvents.map((reminder) => (
                  <div key={reminder.id} className={`list-group-item border-0 px-0 priority-${reminder.priority}`}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">{reminder.title}</h6>
                        <p className="mb-1 small">{reminder.description}</p>
                        <small className="text-muted">{formatDate(reminder.reminder_date)}</small>
                      </div>
                      <span className={getPriorityBadge(reminder.priority)}>{reminder.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
