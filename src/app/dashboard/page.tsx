"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChange, logOut } from "@/lib/firebase"
import type { User as FirebaseUser } from "firebase/auth"
import RemindersModule from "@/components/reminders/RemindersModule"
import TodosModule from "@/components/todos/TodosModule"
import BudgetModule from "@/components/budget/BudgetModule"
import CalendarEventsModule from "@/components/calendar/CalendarEventsModule"
// import "./Dashboard.scss"

export default function Dashboard() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeModule, setActiveModule] = useState("overview")
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)

      if (!user) {
        router.push("/auth/login")
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await logOut()
    router.push("/auth/login")
  }

  const getModuleTitle = () => {
    const titles = {
      overview: "Dashboard Overview",
      reminders: "Reminders",
      todos: "Todo Lists",
      budget: "Budget",
    }
    return titles[activeModule as keyof typeof titles] || "Dashboard"
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="dashboard-container">
      {/* Horizontal Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="app-name">HomeFlow</h1>
          <div className="header-right">
            <span className="user-email"> {user.email}</span>
            <button className="logout-btn" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Left 1/3 - Navigation Modules */}
        <div className="module-navigation">
          <div className="navigation-content">
            <div className="module-buttons">
              <button
                className={`module-btn ${activeModule === "overview" ? "active" : ""}`}
                onClick={() => setActiveModule("overview")}
              >
                <i className="bi bi-house-door"></i>
                <span>Overview</span>
              </button>
              <button
                className={`module-btn ${activeModule === "reminders" ? "active" : ""}`}
                onClick={() => setActiveModule("reminders")}
              >
                <i className="bi bi-bell"></i>
                <span>Reminders</span>
              </button>
              <button
                className={`module-btn ${activeModule === "todos" ? "active" : ""}`}
                onClick={() => setActiveModule("todos")}
              >
                <i className="bi bi-check-square"></i>
                <span>Todo Lists</span>
              </button>
              <button
                className={`module-btn ${activeModule === "budget" ? "active" : ""}`}
                onClick={() => setActiveModule("budget")}
              >
                <i className="bi bi-wallet2"></i>
                <span>Budget</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 2/3 - Content Area */}
        <div className="module-content">
          <div className="content-header">
            <h2>{getModuleTitle()}</h2>
          </div>
          
          <div className="content-body">
            {activeModule === "overview" && (
              <div className="overview-grid">
                <div className="overview-card">
                  <div className="card-header">
                    <i className="bi bi-calendar3 text-primary me-2"></i>
                    <h5>Calendar</h5>
                  </div>
                  <CalendarEventsModule compact={true} />
                </div>
                <div className="overview-card">
                  <div className="card-header">
                    <i className="bi bi-check-square text-success me-2"></i>
                    <h5>Recent Todos</h5>
                  </div>
                  <TodosModule compact={true} />
                </div>
                <div className="overview-card">
                  <div className="card-header">
                    <i className="bi bi-bell text-warning me-2"></i>
                    <h5>Active Reminders</h5>
                  </div>
                  <RemindersModule compact={true} />
                </div>
                <div className="overview-card">
                  <div className="card-header">
                    <i className="bi bi-wallet2 text-info me-2"></i>
                    <h5>Budget Overview</h5>
                  </div>
                  <BudgetModule compact={true} />
                </div>
              </div>
            )}

            {activeModule === "reminders" && <RemindersModule />}
            {activeModule === "todos" && <TodosModule />}
            {activeModule === "budget" && <BudgetModule />}
          </div>
        </div>
      </div>
    </div>
  )
}