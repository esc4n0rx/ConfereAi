// app/admin/equipments/page.tsx
"use client"

import { EquipmentsList } from "@/components/admin/equipment/equipment-list"

export default function EquipmentsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Equipamentos</h1>
          <p className="text-muted-foreground">
            Adicione, edite e gerencie equipamentos do sistema
          </p>
        </div>
        
        <EquipmentsList />
      </div>
    </div>
  )
}