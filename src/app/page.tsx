"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChange } from "@/lib/firebase"
import type { User as FirebaseUser } from "firebase/auth"

export default function Home() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)

      if (user) {
        router.push("/dashboard")
      } else {
        router.push("/auth/login")
      }
    })

    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
    )
  }

  return null
}
