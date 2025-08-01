// Authentication utilities for API routes
import type { NextRequest } from "next/server"
import { getUserByFirebaseUid } from "./database"

export async function verifyAuthToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("No valid authorization header")
    }

    // For development, we'll extract the UID from the token
    // In production, you should verify the Firebase token properly
    const token = authHeader.split("Bearer ")[1]

    // For now, we'll assume the token is the Firebase UID
    // In production, use Firebase Admin SDK to verify the token
    const uid = token

    const user = await getUserByFirebaseUid(uid)
    if (!user) {
      throw new Error("User not found")
    }

    return { user, uid }
  } catch (error) {
    throw new Error("Authentication failed")
  }
}
