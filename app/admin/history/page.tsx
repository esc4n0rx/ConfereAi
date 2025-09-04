import { HistoryTable } from "@/components/admin/reports/history-table"

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Histórico</h1>
        <p className="text-muted-foreground">Visualize o histórico completo de checklists</p>
      </div>

      <HistoryTable />
    </div>
  )
}
