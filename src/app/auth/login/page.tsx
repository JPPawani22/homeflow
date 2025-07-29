"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "@/lib/firebase"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const { user, error: signInError } = await signIn(email, password)

        if (signInError) {
            setError(signInError)
            setLoading(false)
        } else if (user) {
            // Create user in database if doesn't exist
            await fetch("/api/auth/sync-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firebaseUid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                }),
            })

            router.push("/dashboard")
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="text-center mb-4">
                    <h1 className="h3 mb-3 fw-bold text-primary">HomeFlow</h1>
                    <h2 className="h5 mb-0">Welcome Back</h2>
                    <p className="text-muted">Sign in to your account</p>
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                            Email
                        </label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Signing In...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                <div className="text-center">
                    <p className="mb-0">
                        {"Don't have an account? "}
                        <Link href="/auth/register" className="text-primary text-decoration-none">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
