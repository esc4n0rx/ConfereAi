import { AdminLoginForm } from "@/components/auth/admin-login-form"

export const metadata = {
  title: "Login - Sistema de Controle de Equipamentos",
  description: "Acesso administrativo ao sistema de controle de equipamentos",
}

export default function HomePage() {
  return <AdminLoginForm />
}
