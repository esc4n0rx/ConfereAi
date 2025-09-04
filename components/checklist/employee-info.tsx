"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"
import type { Employee } from "@/lib/types"

interface EmployeeInfoProps {
  employee: Employee
}

export function EmployeeInfo({ employee }: EmployeeInfoProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5 text-primary" />
          Informações do Funcionário
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <span className="text-sm text-muted-foreground">Nome:</span>
            <p className="font-medium">{employee.name}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Cargo:</span>
            <Badge variant="secondary">{employee.position}</Badge>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">ID:</span>
            <p className="font-mono text-sm">{employee.id}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
