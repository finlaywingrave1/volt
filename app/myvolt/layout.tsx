import type React from "react"
import { redirect } from "next/navigation"
import { getStaffSession } from "@/lib/staff-session"

export default async function MyVoltLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getStaffSession()

  if (!session) {
    redirect("/myvolt/login")
  }

  return <>{children}</>
}
