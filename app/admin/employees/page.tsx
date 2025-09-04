import { EmployeesList } from "@/components/admin/employees/employees-list"

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Funcionários</h1>
        <p className="text-muted-foreground">Gerencie os funcionários cadastrados no sistema</p>
      </div>

      <EmployeesList />
    </div>
  )
}
