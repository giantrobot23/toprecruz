import type React from "react"
import DashboardLayout from "@/components/dashboard-layout"

export default function CandidatesLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}

