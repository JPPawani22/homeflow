"use client"

import type React from "react"

interface MobileHeaderProps {
  title: string
  onMenuClick: () => void
  actions?: React.ReactNode
  showBack?: boolean
  onBackClick?: () => void
}

export default function MobileHeader({ title, onMenuClick, actions, showBack, onBackClick }: MobileHeaderProps) {
  return (
    <div className="mobile-header d-mobile-only">
      {showBack ? (
        <button className="mobile-menu-btn" onClick={onBackClick}>
          <i className="bi bi-arrow-left"></i>
        </button>
      ) : (
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <i className="bi bi-list"></i>
        </button>
      )}

      <div className="mobile-title">{title}</div>

      {actions && <div className="mobile-actions">{actions}</div>}
    </div>
  )
}
