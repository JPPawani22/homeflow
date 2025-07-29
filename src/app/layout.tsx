import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "bootstrap/dist/css/bootstrap.min.css"
import "../styles/bootstrap-custom.scss"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HomeFlow - Streamline Your Life & Work Balance",
  description: "A comprehensive app to manage your calendar, reminders, todos, and budget in one place.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" />
      </head>
      <body className={inter.className}>
        {children}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
