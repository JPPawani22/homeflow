
import React from "react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        {children}
      </div>
      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex; justify-content: center; align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          position: relative;
          width: 90%;
          max-width: 600px;
        }
        .modal-close {
          position: absolute;
          top: 10px; right: 10px;
          font-size: 1.5rem;
          background: transparent;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
