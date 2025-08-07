"use client"

import type React from "react"

import { useEffect } from "react"

interface MobileBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}
 
export default function MobileBottomSheet({ isOpen, onClose, title, children }: MobileBottomSheetProps) {
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

  return (
    <>
      {isOpen && <div className="mobile-sidebar-overlay show d-mobile-only" onClick={onClose} />}

      <div className={`mobile-bottom-sheet d-mobile-only ${isOpen ? "show" : ""}`}>
        <div className="bottom-sheet-handle"></div>

        <div className="bottom-sheet-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5>{title}</h5>
            <button className="btn btn-link p-0" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        <div className="bottom-sheet-body">{children}</div>
      </div>
    </>
  )
}
