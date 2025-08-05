"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { auth } from "@/lib/firebase"
import type { Reminder } from "@/types"

interface CalendarEventsModuleProps {
  compact?: boolean
}

export default function CalendarEventsModule({ compact = false }: CalendarEventsModuleProps) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
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

  const getTypeBadge = (type: string) => {
    return type === "event" ? "badge bg-info" : "badge bg-secondary"
  }

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getRemindersForDate = (date: Date) => {
    const dateStr = date.toDateString()
    return reminders.filter(reminder => {
      const reminderDate = new Date(reminder.reminder_date)
      return reminderDate.toDateString() === dateStr
    })
  }

  const getUpcomingReminders = () => {
    const now = new Date()
    return reminders
      .filter(reminder => {
        const reminderDate = new Date(reminder.reminder_date)
        return reminderDate >= now && !reminder.is_completed
      })
      .sort((a, b) => new Date(a.reminder_date).getTime() - new Date(b.reminder_date).getTime())
  }

  const getRemindersByPriority = (priority: string) => {
    return getUpcomingReminders()
      .filter(reminder => reminder.priority === priority)
      .slice(0, 5) // Limit to 5 items per priority
  }

  const getSelectedDateReminders = () => {
    return getRemindersForDate(selectedDate)
      .sort((a, b) => new Date(a.reminder_date).getTime() - new Date(b.reminder_date).getTime())
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayReminders = getRemindersForDate(date)
      const isSelected = selectedDate.toDateString() === date.toDateString()
      const isToday = new Date().toDateString() === date.toDateString()

      days.push(
        <div
          key={day}
          className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="day-number">{day}</div>
          {dayReminders.length > 0 && (
            <div className="day-indicators">
              {dayReminders.slice(0, 3).map((reminder, idx) => (
                <div
                  key={idx}
                  className={`indicator priority-${reminder.priority} ${reminder.reminder_type}`}
                  title={reminder.title}
                ></div>
              ))}
              {dayReminders.length > 3 && (
                <div className="indicator more">+{dayReminders.length - 3}</div>
              )}
            </div>
          )}
        </div>
      )
    }

    return days
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

  // Compact view for mobile/overview
  if (compact) {
    const upcomingReminders = getUpcomingReminders().slice(0, 3)
    return (
      <div className="compact-calendar">
        {upcomingReminders.length === 0 ? (
          <p className="text-muted mb-0">No upcoming events</p>
        ) : (
          <div className="list-group list-group-flush">
            {upcomingReminders.map((reminder) => (
              <div key={reminder.id} className="list-group-item border-0 px-0 py-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-medium">{reminder.title}</div>
                    <small className="text-muted">
                      {formatDate(reminder.reminder_date)}
                    </small>
                  </div>
                  <span className={getPriorityBadge(reminder.priority)}>
                    {reminder.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="calendar-events-module">
      <h2 className="mb-4">Calendar & Events</h2>
      <style jsx>{`
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: #e9ecef;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .calendar-day {
          background: white;
          min-height: 80px;
          padding: 8px;
          cursor: pointer;
          position: relative;
          transition: background-color 0.2s;
        }
        
        .calendar-day:hover {
          background: #f8f9fa;
        }
        
        .calendar-day.selected {
          background: #e3f2fd;
          border: 2px solid #2196f3;
        }
        
        .calendar-day.today {
          background: #fff3e0;
        }
        
        .calendar-day.empty {
          background: #f8f9fa;
          cursor: default;
        }
        
        .day-number {
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .day-indicators {
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
        }
        
        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          font-size: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .indicator.priority-high {
          background: #dc3545;
        }
        
        .indicator.priority-medium {
          background: #ffc107;
        }
        
        .indicator.priority-low {
          background: #28a745;
        }
        
        .indicator.event {
          border: 2px solid #17a2b8;
          background: white;
        }
        
        .indicator.more {
          background: #6c757d;
          color: white;
          font-size: 6px;
          width: 12px;
          height: 12px;
        }
        
        .calendar-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: #495057;
          color: white;
          text-align: center;
          font-weight: 600;
        }
        
        .calendar-header div {
          padding: 12px 8px;
        }
        
        .priority-table {
          max-height: 300px;
          overflow-y: auto;
        }
        
        @media (max-width: 768px) {
          .calendar-day {
            min-height: 60px;
            padding: 4px;
          }
          
          .day-number {
            font-size: 12px;
          }
          
          .indicator {
            width: 6px;
            height: 6px;
          }
        }
      `}</style>

      <div className="row">
        {/* Calendar Section */}
        <div className="col-lg-8 mb-4">
          <div className="homeflow-card card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h5>
              <div className="btn-group">
                <button className="btn btn-outline-primary btn-sm" onClick={() => navigateMonth(-1)}>
                  <i className="bi bi-chevron-left"></i>
                </button>
                <button 
                  className="btn btn-outline-primary btn-sm" 
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </button>
                <button className="btn btn-outline-primary btn-sm" onClick={() => navigateMonth(1)}>
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="calendar-header">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>
              <div className="calendar-grid">
                {renderCalendarDays()}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Date Events */}
        <div className="col-lg-4 mb-4">
          <div className="homeflow-card card">
            <div className="card-header">
              <h5 className="mb-0">
                Events for {selectedDate.toLocaleDateString("en-US", { 
                  weekday: "long", 
                  month: "short", 
                  day: "numeric" 
                })}
              </h5>
            </div>
            <div className="card-body">
              {getSelectedDateReminders().length === 0 ? (
                <p className="text-muted text-center">No events for this date</p>
              ) : (
                <div className="list-group list-group-flush">
                  {getSelectedDateReminders().map((reminder) => (
                    <div key={reminder.id} className="list-group-item border-0 px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{reminder.title}</h6>
                          <div className="mb-2">
                            <span className={getPriorityBadge(reminder.priority)}>{reminder.priority}</span>
                            <span className={`ms-1 ${getTypeBadge(reminder.reminder_type)}`}>
                              {reminder.reminder_type}
                            </span>
                          </div>
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            {formatTime(reminder.reminder_date)}
                          </small>
                          {reminder.description && (
                            <p className="mb-0 mt-1 text-muted small">{reminder.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Priority Tables */}
      <div className="mb-4">
        <h4 className="mb-3">Priority Overview</h4>
        
        {/* High Priority Table */}
        <div className="mb-4">
          <div className="homeflow-card card">
            <div className="card-header" style={{backgroundColor: '#f8d7da', color: '#721c24'}}>
              <h5 className="mb-0">
                <i className="bi bi-exclamation-triangle me-2"></i>
                High Priority ({getRemindersByPriority('high').length})
              </h5>
            </div>
            <div className="card-body p-0">
              {getRemindersByPriority('high').length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-exclamation-triangle display-4 text-muted opacity-50"></i>
                  <p className="text-muted mt-2">No high priority items</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-bordered mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="fw-semibold border-end">Title</th>
                        <th className="fw-semibold border-end">Type</th>
                        <th className="fw-semibold border-end">Date & Time</th>
                        <th className="fw-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getRemindersByPriority('high').map((reminder) => (
                        <tr key={reminder.id} className="align-middle">
                          <td className="border-end">
                            <div className="fw-medium text-dark">{reminder.title}</div>
                          </td>
                          <td className="border-end">
                            <span className={`${getTypeBadge(reminder.reminder_type)} text-capitalize`}>
                              {reminder.reminder_type}
                            </span>
                          </td>
                          <td className="border-end">
                            <div className="text-muted d-flex align-items-center">
                              <i className="bi bi-calendar3 me-2"></i>
                              <span className="small">{formatDate(reminder.reminder_date)}</span>
                            </div>
                          </td>
                          <td>
                            <div className="text-muted small" style={{maxWidth: '200px'}}>
                              {reminder.description ? (
                                <span className="text-truncate d-inline-block w-100" title={reminder.description}>
                                  {reminder.description}
                                </span>
                              ) : (
                                <span className="text-muted fst-italic">No description</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Medium Priority Table */}
        <div className="mb-4">
          <div className="homeflow-card card">
            <div className="card-header" style={{backgroundColor: '#fff3cd', color: '#856404'}}>
              <h5 className="mb-0">
                <i className="bi bi-exclamation-circle me-2"></i>
                Medium Priority ({getRemindersByPriority('medium').length})
              </h5>
            </div>
            <div className="card-body p-0">
              {getRemindersByPriority('medium').length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-exclamation-circle display-4 text-muted opacity-50"></i>
                  <p className="text-muted mt-2">No medium priority items</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-bordered mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="fw-semibold border-end">Title</th>
                        <th className="fw-semibold border-end">Type</th>
                        <th className="fw-semibold border-end">Date & Time</th>
                        <th className="fw-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getRemindersByPriority('medium').map((reminder) => (
                        <tr key={reminder.id} className="align-middle">
                          <td className="border-end">
                            <div className="fw-medium text-dark">{reminder.title}</div>
                          </td>
                          <td className="border-end">
                            <span className={`${getTypeBadge(reminder.reminder_type)} text-capitalize`}>
                              {reminder.reminder_type}
                            </span>
                          </td>
                          <td className="border-end">
                            <div className="text-muted d-flex align-items-center">
                              <i className="bi bi-calendar3 me-2"></i>
                              <span className="small">{formatDate(reminder.reminder_date)}</span>
                            </div>
                          </td>
                          <td>
                            <div className="text-muted small" style={{maxWidth: '200px'}}>
                              {reminder.description ? (
                                <span className="text-truncate d-inline-block w-100" title={reminder.description}>
                                  {reminder.description}
                                </span>
                              ) : (
                                <span className="text-muted fst-italic">No description</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Low Priority Table */}
        <div className="mb-4">
          <div className="homeflow-card card">
            <div className="card-header" style={{backgroundColor: '#d4f6d4', color: '#155724'}}>
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Low Priority ({getRemindersByPriority('low').length})
              </h5>
            </div>
            <div className="card-body p-0">
              {getRemindersByPriority('low').length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-info-circle display-4 text-muted opacity-50"></i>
                  <p className="text-muted mt-2">No low priority items</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-bordered mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="fw-semibold border-end">Title</th>
                        <th className="fw-semibold border-end">Type</th>
                        <th className="fw-semibold border-end">Date & Time</th>
                        <th className="fw-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getRemindersByPriority('low').map((reminder) => (
                        <tr key={reminder.id} className="align-middle">
                          <td className="border-end">
                            <div className="fw-medium text-dark">{reminder.title}</div>
                          </td>
                          <td className="border-end">
                            <span className={`${getTypeBadge(reminder.reminder_type)} text-capitalize`}>
                              {reminder.reminder_type}
                            </span>
                          </td>
                          <td className="border-end">
                            <div className="text-muted d-flex align-items-center">
                              <i className="bi bi-calendar3 me-2"></i>
                              <span className="small">{formatDate(reminder.reminder_date)}</span>
                            </div>
                          </td>
                          <td>
                            <div className="text-muted small" style={{maxWidth: '200px'}}>
                              {reminder.description ? (
                                <span className="text-truncate d-inline-block w-100" title={reminder.description}>
                                  {reminder.description}
                                </span>
                              ) : (
                                <span className="text-muted fst-italic">No description</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
