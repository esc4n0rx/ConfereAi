import { AdminLoginForm } from "@/components/auth/admin-login-form"

export const metadata = {
  title: "Login - ConfereAi",
  description: "Acesso administrativo ao sistema de controle de equipamentos",
}

export default function HomePage() {
  return <AdminLoginForm />
}
