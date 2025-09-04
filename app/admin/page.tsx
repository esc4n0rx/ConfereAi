// app/admin/page.tsx
import { StatsCards } from "@/components/admin/stats-cards"
import { RecentActivity } from "@/components/admin/recent-activity"
import { ChecklistLinks } from "@/components/admin/checklist-links"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema de controle de equipamentos</p>
      </div>

      <StatsCards />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity />
        <ChecklistLinks />
      </div>
    </div>
  )
}