// Database connection and utilities
import mysql from "mysql2/promise"

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "homeflow",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
}

let pool: mysql.Pool

export const getConnection = async () => {
    if (!pool) {
        pool = mysql.createPool(dbConfig)
    }
    return pool
}

export const executeQuery = async (query: string, params: any[] = []) => {
    try {
        const connection = await getConnection()
        const [results] = await connection.execute(query, params)
        return results
    } catch (error) {
        console.error("Database query error:", error)
        throw error
    }
}

// User management functions
export const createUser = async (firebaseUid: string, email: string, displayName?: string) => {
    const query = `
    INSERT INTO users (firebase_uid, email, display_name) 
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE 
    email = VALUES(email), 
    display_name = VALUES(display_name)
  `
    return executeQuery(query, [firebaseUid, email, displayName])
}

export const getUserByFirebaseUid = async (firebaseUid: string) => {
    const query = "SELECT * FROM users WHERE firebase_uid = ?"
    const results = (await executeQuery(query, [firebaseUid])) as any[]
    return results[0] || null
}
