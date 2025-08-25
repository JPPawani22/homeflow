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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
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

  const getSelectedDateReminders = () => {
    return getRemindersForDate(selectedDate)
      .sort((a, b) => new Date(a.reminder_date).getTime() - new Date(b.reminder_date).getTime())
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
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

  // Only compact view is supported
  return (
    <>
      <div className="compact-calendar" style={{ position: 'relative' }}>
      <style jsx>{`
        .compact-calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: #e9ecef;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          overflow: hidden;
          width: 100%;
        }
        
        .compact-calendar-day {
          background: white;
          min-height: 25px;
          padding: 2px;
          cursor: pointer;
          position: relative;
          transition: background-color 0.2s;
          font-size: 10px;
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          width: 100%;
          box-sizing: border-box;
        }
        
        .compact-calendar-day:hover {
          background: #f8f9fa;
        }
        
        .compact-calendar-day.selected {
          background: #e3f2fd;
          border: 1px solid #2196f3;
        }
        
        .compact-calendar-day.today {
          background: #e8d8ff;
          border: 1px solid #672594;
        }
        
        .compact-calendar-day.empty {
          background: #f8f9fa;
          cursor: default;
        }
        
        .compact-day-number {
          font-weight: 600;
          font-size: 9px;
          margin-bottom: 1px;
        }
        
        .compact-day-indicators {
          display: flex;
          flex-direction: column;
          gap: 1px;
          margin-top: auto;
          padding: 1px;
          position: relative;
        }
        
        .compact-indicator {
          border-radius: 3px;
          padding: 2px 4px;
          font-size: 8px;
          color: white;
          font-weight: 500;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
          min-height: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .compact-indicator:hover {
          transform: scale(1.05);
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .compact-indicator.active {
          transform: scale(1.05);
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .compact-indicator.priority-high {
          background: linear-gradient(135deg, #dc3545, #c82333);
        }
        
        .compact-indicator.priority-medium {
          background: linear-gradient(135deg, #ffc107, #e0a800);
          color: #000;
        }
        
        .compact-indicator.priority-low {
          background: linear-gradient(135deg, #28a745, #218838);
        }
        
        
        .card-title {
          font-weight: 600;
          margin-bottom: 6px;
          color: #2c3e50;
          font-size: 13px;
          line-height: 1.3;
        }
        
        .event-details-card .card-time {
          color: #6c757d;
          font-size: 11px;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
        }
        
        .event-details-card .card-description {
          color: #6c757d;
          font-size: 11px;
          margin: 6px 0;
          line-height: 1.4;
        }
        
        .event-details-card .card-priority {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          margin-top: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .card-priority.high {
          background: #dc3545;
          color: white;
        }
        
        .card-priority.medium {
          background: #ffc107;
          color: #000;
        }
        
        .card-priority.low {
          background: #28a745;
          color: white;
        }
        
        .compact-indicator.more {
          background: linear-gradient(135deg, #6c757d, #5a6268);
          color: white;
          text-align: center;
          font-size: 6px;
          padding: 1px 2px;
        }
        
        .compact-calendar-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: linear-gradient(135deg, #672594 10%, #2094be 100%);
          color: white;
          text-align: center;
          font-weight: 600;
          font-size: 11px;
        }
        
        .compact-calendar-header div {
          padding: 6px 2px;
        }
        
        .compact-month-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 6px;
        }
        
        .compact-month-title {
          font-size: 14px;
          font-weight: 600;
          color: #495057;
        }
        
        .compact-nav-btn {
          background: none;
          border: 1px solid #dee2e6;
          color: #495057;
          border-radius: 4px;
          padding: 4px 8px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }
        
        .compact-nav-btn:hover {
          background: #e9ecef;
          border-color: #adb5bd;
        }
        
        .compact-btn-group {
          display: flex;
          gap: 2px;
        }
      `}</style>
      
      <div className="compact-month-header">
        <div className="compact-month-title">
          {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </div>
        <div className="compact-btn-group">
          <button className="compact-nav-btn" onClick={() => navigateMonth(-1)}>
            <i className="bi bi-chevron-left"></i>
          </button>
          <button className="compact-nav-btn" onClick={() => setCurrentDate(new Date())}>
            Today
          </button>
          <button className="compact-nav-btn" onClick={() => navigateMonth(1)}>
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
      
      <div className="compact-calendar-header">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>
      <div className="compact-calendar-grid">
        {(() => {
          const daysInMonth = getDaysInMonth(currentDate)
          const firstDay = getFirstDayOfMonth(currentDate)
          const days = []

          // Empty cells for days before the first day of the month
          for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="compact-calendar-day empty"></div>)
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
                className={`compact-calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => {
                  setSelectedDate(date);
                }}
              >
                <div className="compact-day-number">{day}</div>
                {dayReminders.length > 0 && (
                  <div className="compact-day-indicators">
                    {dayReminders.slice(0, 2).map((reminder, idx) => (
                      <div
                        key={idx}
                        className={`compact-indicator priority-${reminder.priority}`}
                      >
                        {reminder.title.length > 8 ? reminder.title.substring(0, 8) + '...' : reminder.title}
                      </div>
                    ))}
                    {dayReminders.length > 2 && (
                      <div className="compact-indicator more">
                        +{dayReminders.length - 2}
                      </div>
                    )}
                    
                    {/* Remove card from here - will render globally */}
                  </div>
                )}
                
                {/* Remove old event details card */}
              </div>
            )
          }
          return days
        })()}
      </div>
      
      {/* Selected Date Events */}
      {getSelectedDateReminders().length > 0 && (
        <div style={{marginTop: '15px', padding: '12px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef'}}>
          <div style={{fontSize: '14px', fontWeight: 'bold', color: '#495057', marginBottom: '10px'}}>
            Events for {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            {getSelectedDateReminders().map((reminder, idx) => (
              <div key={idx} style={{
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '8px 10px',
                background: 'white',
                borderRadius: '6px',
                border: '1px solid #dee2e6',
                fontSize: '13px'
              }}>
                <div style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: 'white',
                  background: reminder.priority === 'high' ? '#dc3545' : 
                             reminder.priority === 'medium' ? '#ffc107' : '#28a745',
                  minWidth: '50px',
                  textAlign: 'center'
                }}>
                  {reminder.priority.toUpperCase()}
                </div>
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 'bold', color: '#212529', marginBottom: '2px'}}>
                    {reminder.title}
                  </div>
                  <div style={{color: '#6c757d', fontSize: '12px'}}>
                    <i className="bi bi-clock me-1"></i>
                    {reminder.reminder_date ? formatTime(reminder.reminder_date) : 'No time set'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  )
}