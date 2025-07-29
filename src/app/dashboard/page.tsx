"use client"

import { SetStateAction, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChange, logOut } from "@/lib/firebase"
import type { User as FirebaseUser } from "firebase/auth"
import CalendarModule from "@/components/calendar/CalendarModule"
import RemindersModule from "@/components/reminders/RemindersModule"
import TodosModule from "@/components/todos/TodosModule"
import BudgetModule from "@/components/budget/BudgetModule"

export default function Dashboard() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeModule, setActiveModule] = useState("overview")
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user: SetStateAction<FirebaseUser | null>) => {
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
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 sidebar p-0">
          <div className="d-flex flex-column p-3 text-white">
            <div className="mb-4">
              <h4 className="fw-bold">HomeFlow</h4>
              <small className="opacity-75">Welcome, {user.email}</small>
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

            <div className="mt-auto">
              <button className="btn btn-outline-light w-100" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-lg-10 main-content">
          <div className="p-4">
            {activeModule === "overview" && (
              <div>
                <h2 className="mb-4">Dashboard Overview</h2>
                <div className="row">
                  <div className="col-lg-6 mb-4">
                    <div className="homeflow-card card h-100">
                      <div className="card-body">
                        <h5 className="card-title">
                          <i className="bi bi-calendar3 text-primary me-2"></i>
                          Upcoming Events
                        </h5>
                        <CalendarModule compact={true} />
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
                <CalendarModule />
              </div>
            )}

            {activeModule === "reminders" && (
              <div>
                <h2 className="mb-4">Reminders & Events</h2>
                <RemindersModule />
              </div>
            )}

            {activeModule === "todos" && (
              <div>
                <h2 className="mb-4">Todo Lists</h2>
                <TodosModule />
              </div>
            )}

            {activeModule === "budget" && (
              <div>
                <h2 className="mb-4">Budget & Expenses</h2>
                <BudgetModule />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
