import { EquipmentList } from "@/components/admin/equipment/equipment-list"

export default function EquipmentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Equipamentos</h1>
        <p className="text-muted-foreground">Gerencie os equipamentos e seus checklists</p>
      </div>

      <EquipmentList />
    </div>
  )
}
