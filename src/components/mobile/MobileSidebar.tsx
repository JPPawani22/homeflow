"use client"

import { useEffect } from "react"
import type { User as FirebaseUser } from "firebase/auth"

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
  user: FirebaseUser | null
  activeModule: string
  onModuleChange: (module: string) => void
  onLogout: () => void
}

export default function MobileSidebar({
  isOpen,
  onClose,
  user,
  activeModule,
  onModuleChange,
  onLogout,
}: MobileSidebarProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const menuItems = [
    { key: "overview", label: "Overview", icon: "bi-house-door" },
    { key: "calendar", label: "Calendar", icon: "bi-calendar3" },
    { key: "reminders", label: "Reminders", icon: "bi-bell" },
    { key: "todos", label: "Todo Lists", icon: "bi-check-square" },
    { key: "budget", label: "Budget", icon: "bi-wallet2" },
  ]

  const handleItemClick = (module: string) => {
    onModuleChange(module)
    onClose()
  }

  return (
    <>
      <div className={`mobile-sidebar-overlay d-mobile-only ${isOpen ? "show" : ""}`} onClick={onClose} />

      <div className={`mobile-sidebar d-mobile-only ${isOpen ? "show" : ""}`}>
        <div className="p-3 text-white">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold mb-1">HomeFlow</h4>
              <small className="opacity-75">Welcome, {user?.email?.split("@")[0]}</small>
            </div>
            <button className="btn btn-link text-white p-0" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* Navigation */}
          <nav className="nav nav-pills flex-column">
            {menuItems.map((item) => (
              <button
                key={item.key}
                className={`nav-link text-start mb-2 w-100 ${activeModule === item.key ? "active" : "text-white"}`}
                onClick={() => handleItemClick(item.key)}
              >
                <i className={`${item.icon} me-3`}></i>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="mt-auto pt-4">
            <button className="btn btn-outline-light w-100" onClick={onLogout}>
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
