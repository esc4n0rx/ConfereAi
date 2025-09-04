"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { EmployeeAccessForm } from "@/components/auth/employee-access-form"

export default function ChecklistPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if employee is already logged in
    const employeeId = sessionStorage.getItem("employee_id")
    if (employeeId) {
      router.push(`/checklist/portal?employee=${employeeId}`)
    }
  }, [router])

  return <EmployeeAccessForm />
}
