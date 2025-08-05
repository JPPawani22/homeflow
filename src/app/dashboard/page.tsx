"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChange, logOut } from "@/lib/firebase"
import type { User as FirebaseUser } from "firebase/auth"
import RemindersModule from "@/components/reminders/RemindersModule"
import TodosModule from "@/components/todos/TodosModule"
import BudgetModule from "@/components/budget/BudgetModule"
import MobileHeader from "@/components/mobile/MobileHeader"
import MobileSidebar from "@/components/mobile/MobileSidebar"
import CalendarModule from "@/components/calendar/CalendarModule"
import CalendarEventsModule from "@/components/calendar/CalendarEventsModule"

export default function Dashboard() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeModule, setActiveModule] = useState("overview")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
      overview: "Dashboard",
      calendar: "Calendar",
      reminders: "Reminders",
      todos: "Todo Lists",
      budget: "Budget",
    }
    return titles[activeModule as keyof typeof titles] || "Dashboard"
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
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
    <>
      {/* Mobile Header */}
      <MobileHeader title={getModuleTitle()} onMenuClick={() => setMobileMenuOpen(true)} />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        onLogout={handleLogout}
      />

      <div className="container-fluid">
        <div className="row">
          {/* Desktop Sidebar */}
          <div className="col-md-3 col-lg-2 sidebar p-0 d-mobile-none">
            <div className="d-flex flex-column p-3 text-white">
              <div className="mb-4">
                <h2 className="fw" style={{ fontFamily: "fantasy, cursive", letterSpacing: "3px" }}>
                  HomeFlow
                </h2>
                <small className="opacity-75">Welcome,<br></br><b>{user.email}</b> </small>
              </div>

              <nav className="nav nav-pills flex-column">
                <button
                  className={`nav-link text-start mb-2 ${activeModule === "overview" ? "active" : "text-white"}`}
                  onClick={() => setActiveModule("overview")}
                >
                  <i className="bi bi-house-door me-2"></i>
                  Overview
                </button>
                <button
                  className={`nav-link text-start mb-2 ${activeModule === "calendar" ? "active" : "text-white"}`}
                  onClick={() => setActiveModule("calendar")}
                >
                  <i className="bi bi-calendar3 me-2"></i>
                  Calendar
                </button>
                <button
                  className={`nav-link text-start mb-2 ${activeModule === "reminders" ? "active" : "text-white"}`}
                  onClick={() => setActiveModule("reminders")}
                >
                  <i className="bi bi-bell me-2"></i>
                  Reminders
                </button>
                <button
                  className={`nav-link text-start mb-2 ${activeModule === "todos" ? "active" : "text-white"}`}
                  onClick={() => setActiveModule("todos")}
                >
                  <i className="bi bi-check-square me-2"></i>
                  Todo Lists
                </button>
                <button
                  className={`nav-link text-start mb-2 ${activeModule === "budget" ? "active" : "text-white"}`}
                  onClick={() => setActiveModule("budget")}
                >
                  <i className="bi bi-wallet2 me-2"></i>
                  Budget
                </button>
              </nav>

                <div className="position-absolute bottom-0 start-10 p-3">
                <button className="btn btn-outline-light w-100" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </button>
                </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-md-9 col-lg-10 main-content">
            <div className="mobile-content">
              <div className="p-4 d-mobile-none">
                {/* Desktop content with original styling */}
                {activeModule === "overview" && (
                  <div>
                    <h2 className="mb-4">Dashboard</h2>
                    <div className="row">
                      <div className="col-lg-6 mb-4">
                        <div className="homeflow-card card h-100">
                          <div className="card-body">
                            <h5 className="card-title">
                              <i className="bi bi-calendar3 text-primary me-2"></i>
                              Upcoming Events
                            </h5>
                            <CalendarModule compact={true} children={undefined} />
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6 mb-4">
                        <div className="homeflow-card card h-100">
                          <div className="card-body">
                            <h5 className="card-title">
                              <i className="bi bi-check-square text-success me-2"></i>
                              Recent Todos
                            </h5>
                            <TodosModule compact={true} />
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6 mb-4">
                        <div className="homeflow-card card h-100">
                          <div className="card-body">
                            <h5 className="card-title">
                              <i className="bi bi-bell text-warning me-2"></i>
                              Active Reminders
                            </h5>
                            <RemindersModule compact={true} />
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6 mb-4">
                        <div className="homeflow-card card h-100">
                          <div className="card-body">
                            <h5 className="card-title">
                              <i className="bi bi-wallet2 text-info me-2"></i>
                              Budget Overview
                            </h5>
                            <BudgetModule compact={true} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeModule === "calendar" && (
                  <div>
                    <h2 className="mb-4">Calendar & Events</h2>
                    <CalendarEventsModule />
                  </div>
                )}

                {activeModule === "reminders" && (
                  <div>
                    <RemindersModule />
                  </div>
                )}

                {activeModule === "todos" && (
                  <div>
                    <TodosModule />
                  </div>
                )}

                {activeModule === "budget" && (
                  <div>
                    <BudgetModule />
                  </div>
                )}
              </div>

              {/* Mobile content */}
              <div className="p-3 d-mobile-only">
                {activeModule === "overview" && (
                  <div>
                    <div className="homeflow-card card mb-3">
                      <div className="card-body">
                        <h6 className="card-title">
                          <i className="bi bi-calendar3 text-primary me-2"></i>
                          Upcoming Events
                        </h6>
                        <CalendarModule compact={true} children={undefined} />
                      </div>
                    </div>
                    <div className="homeflow-card card mb-3">
                      <div className="card-body">
                        <h6 className="card-title">
                          <i className="bi bi-check-square text-success me-2"></i>
                          Recent Todos
                        </h6>
                        <TodosModule compact={true} />
                      </div>
                    </div>
                    <div className="homeflow-card card mb-3">
                      <div className="card-body">
                        <h6 className="card-title">
                          <i className="bi bi-bell text-warning me-2"></i>
                          Active Reminders
                        </h6>
                        <RemindersModule compact={true} />
                      </div>
                    </div>
                    <div className="homeflow-card card mb-3">
                      <div className="card-body">
                        <h6 className="card-title">
                          <i className="bi bi-wallet2 text-info me-2"></i>
                          Budget Overview
                        </h6>
                        <BudgetModule compact={true} />
                      </div>
                    </div>
                  </div>
                )}

                {activeModule === "calendar" && <CalendarEventsModule />}
                {activeModule === "reminders" && <RemindersModule />}
                {activeModule === "todos" && <TodosModule />}
                {activeModule === "budget" && <BudgetModule />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
