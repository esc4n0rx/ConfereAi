// app/admin/reports/page.tsx
import { ReportsDashboard } from "@/components/admin/reports/reports-dashboard"
import { HistoryTable } from "@/components/admin/reports/history-table"
import { ChecklistReports } from "@/components/admin/reports/checklist-reports"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground">Visualize relatórios detalhados do sistema</p>
      </div>

      <ReportsDashboard />
      <ChecklistReports />
      <HistoryTable />
    </div>
  )
}