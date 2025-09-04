"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/auth"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      setTimeout(() => {
        const sessionData = typeof window !== "undefined" ? localStorage.getItem("admin_session") : null
        console.log("[v0] AuthGuard - Session data exists:", !!sessionData)

        if (sessionData) {
          try {
            const session = JSON.parse(sessionData)
            console.log("[v0] AuthGuard - Session parsed:", session.user?.email)
            console.log("[v0] AuthGuard - Session expires at:", new Date(session.expiresAt))
            console.log("[v0] AuthGuard - Current time:", new Date())
          } catch (e) {
            console.log("[v0] AuthGuard - Error parsing session:", e)
          }
        }

        const authenticated = AuthService.isAuthenticated()
        console.log("[v0] AuthGuard - Final authenticated result:", authenticated)
        setIsAuthenticated(authenticated)
        setIsLoading(false)

        if (requireAuth && !authenticated) {
          console.log("[v0] AuthGuard - Redirecting to login")
          router.push("/")
        }
      }, 500) // Increased delay from 100ms to 500ms to ensure localStorage is fully persisted
    }

    checkAuth()

    const handleStorageChange = () => {
      console.log("[v0] AuthGuard - Storage changed, rechecking auth")
      checkAuth()
    }

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange)
      return () => window.removeEventListener("storage", handleStorageChange)
    }
  }, [requireAuth, router])

  if (isLoading || (requireAuth && isAuthenticated === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return null // Will redirect to login
  }

  return <>{children}</>
}
