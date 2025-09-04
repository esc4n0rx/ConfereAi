// components/admin/admin-header.tsx
"use client"

import { useEffect, useState } from "react"
import { AuthService } from "@/lib/auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { AdminUser } from "@/lib/api/auth"

export function AdminHeader() {
  const [user, setUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await AuthService.getSession()
        setUser(currentUser)
      } catch (error) {
        console.error("Error loading user session:", error)
      }
    }

    loadUser()
  }, [])

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Sistema de Controle de Equipamentos</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{user?.name || "Carregando..."}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{user?.matricula}</span>
            {user?.role && (
              <>
                <span>•</span>
                <span className="capitalize">{user.role.replace('_', ' ')}</span>
              </>
            )}
          </div>
        </div>
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">
            {user?.name?.charAt(0) || "A"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}