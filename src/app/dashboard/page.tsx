"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChange, logOut } from "@/lib/firebase"
import type { User as FirebaseUser } from "firebase/auth"
import RemindersModule from "@/components/reminders/RemindersModule"
import TodosModule from "@/components/todos/TodosModule"
import BudgetModule from "@/components/budget/BudgetModule"
import CalendarEventsModule from "@/components/calendar/CalendarEventsModule"

// Import Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faHouse, 
  faBell, 
  faSquareCheck, 
  faWallet, 
  faRightFromBracket,
  faEnvelope,
  faCalendar,
  faUser,
} from '@fortawesome/free-solid-svg-icons'
import { 
  faFacebookF, 
  faTwitter, 
  faInstagram, 
  faLinkedinIn 
} from '@fortawesome/free-brands-svg-icons'

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
          <h1 className="app-name"><FontAwesomeIcon icon={faHouse} className="me" />HomeFlow</h1>
          <div className="header-right">
            <span className="user-email"> <FontAwesomeIcon icon={faUser} className="me-2" />{user.email}</span>
            <button className="logout-btn" onClick={handleLogout}>
              <FontAwesomeIcon icon={faRightFromBracket} className="me-2" />
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
                <FontAwesomeIcon icon={faHouse} />
                <span>Overview</span>
              </button>
              <button
                className={`module-btn ${activeModule === "reminders" ? "active" : ""}`}
                onClick={() => setActiveModule("reminders")}
              >
                <FontAwesomeIcon icon={faBell} />
                <span>Reminders</span>
              </button>
              <button
                className={`module-btn ${activeModule === "todos" ? "active" : ""}`}
                onClick={() => setActiveModule("todos")}
              >
                <FontAwesomeIcon icon={faSquareCheck} />
                <span>Todo Lists</span>
              </button>
              <button
                className={`module-btn ${activeModule === "budget" ? "active" : ""}`}
                onClick={() => setActiveModule("budget")}
              >
                <FontAwesomeIcon icon={faWallet} />
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
                    <FontAwesomeIcon icon={faCalendar} className="text-primary me-2" />
                    <h5>Calendar</h5>
                  </div>
                  <CalendarEventsModule compact={true} />
                </div>
                <div className="overview-card">
                  <div className="card-header">
                    <FontAwesomeIcon icon={faWallet} className="text-info me-2" />
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

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-left">
            <p className="copyright">
              © {new Date().getFullYear()} HomeFlow. All rights reserved. @ladybug ❤️
            </p>
          </div>
          <div className="footer-right">
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <FontAwesomeIcon icon={faLinkedinIn} />
              </a>
              <a href="#" className="social-link" aria-label="Contact Us">
                <FontAwesomeIcon icon={faEnvelope} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}