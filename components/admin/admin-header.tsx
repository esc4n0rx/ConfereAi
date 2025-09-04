"use client"

import { AuthService } from "@/lib/auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function AdminHeader() {
  const user = AuthService.getAdminSession()

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Sistema de Controle de Equipamentos</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">{user?.name?.charAt(0) || "A"}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
