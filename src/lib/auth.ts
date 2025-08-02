// Authentication utilities for API routes
import type { NextRequest } from "next/server"
import { getUserByFirebaseUid, createUser } from "./database"

export async function verifyAuthToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("No valid authorization header")
    }

    const token = authHeader.split("Bearer ")[1]

    // For development: Extract UID from JWT token payload
    // In production, use Firebase Admin SDK to verify the token properly
    let uid: string

    try {
      // Decode JWT token to get the UID (development only)
      const payload = JSON.parse(atob(token.split(".")[1]))
      uid = payload.user_id || payload.sub

      if (!uid) {
        throw new Error("No UID found in token")
      }
    } catch (decodeError) {
      // If token decoding fails, treat the token as UID for backward compatibility
      // This is a fallback for development
      uid = token.length > 100 ? token.substring(0, 28) : token
    }

    // Try to get the user from database
    let user = await getUserByFirebaseUid(uid)

    // If user doesn't exist, create them
    if (!user) {
      // For development, we'll create a basic user
      // In production, you should get email from the verified Firebase token
      const email = `user-${uid.substring(0, 8)}@example.com`
      await createUser(uid, email, `User ${uid.substring(0, 8)}`)
      user = await getUserByFirebaseUid(uid)

      if (!user) {
        throw new Error("Failed to create user")
      }
    }

    return { user, uid }
  } catch (error) {
    console.error("Authentication error:", error)
    throw new Error("Authentication failed")
  }
}
