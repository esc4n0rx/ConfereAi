"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { dataStore } from "@/lib/data-store"
import { EmployeeInfo } from "@/components/checklist/employee-info"
import { ActionSelector } from "@/components/checklist/action-selector"
import { EquipmentSelector } from "@/components/checklist/equipment-selector"
import { ChecklistForm } from "@/components/checklist/checklist-form"
import { SuccessScreen } from "@/components/checklist/success-screen"
import type { Employee, Equipment, ChecklistAction } from "@/lib/types"

type Step = "action" | "equipment" | "checklist" | "success"

export default function ChecklistPortalPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const employeeId = searchParams.get("employee")

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [currentStep, setCurrentStep] = useState<Step>("action")
  const [selectedAction, setSelectedAction] = useState<ChecklistAction | null>(null)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [hasIssues, setHasIssues] = useState(false)

  useEffect(() => {
    if (!employeeId) {
      router.push("/checklist")
      return
    }

    const emp = dataStore.getEmployeeById(employeeId)
    if (!emp) {
      router.push("/checklist")
      return
    }

    setEmployee(emp)
  }, [employeeId, router])

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  const handleActionSelect = (action: ChecklistAction) => {
    setSelectedAction(action)
    setCurrentStep("equipment")
  }

  const handleEquipmentSelect = (equipment: Equipment) => {
    setSelectedEquipment(equipment)
    setCurrentStep("checklist")
  }

  const handleChecklistComplete = () => {
    // In a real implementation, you would get this from the form submission
    setHasIssues(Math.random() > 0.7) // Random for demo
    setCurrentStep("success")
  }

  const handleBackToAction = () => {
    setSelectedAction(null)
    setCurrentStep("action")
  }

  const handleBackToEquipment = () => {
    setSelectedEquipment(null)
    setCurrentStep("equipment")
  }

  if (currentStep === "success" && selectedAction && selectedEquipment) {
    return (
      <SuccessScreen employee={employee} equipment={selectedEquipment} action={selectedAction} hasIssues={hasIssues} />
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <EmployeeInfo employee={employee} />

        {currentStep === "action" && <ActionSelector onActionSelect={handleActionSelect} />}

        {currentStep === "equipment" && selectedAction && (
          <EquipmentSelector
            action={selectedAction}
            onEquipmentSelect={handleEquipmentSelect}
            onBack={handleBackToAction}
          />
        )}

        {currentStep === "checklist" && selectedAction && selectedEquipment && (
          <ChecklistForm
            employee={employee}
            equipment={selectedEquipment}
            action={selectedAction}
            onBack={handleBackToEquipment}
            onComplete={handleChecklistComplete}
          />
        )}
      </div>
    </div>
  )
}
