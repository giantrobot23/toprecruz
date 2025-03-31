"use client"

import { useEffect } from "react"
import { redirect } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loading } from "@/components/ui/loading"

export default function Home() {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        redirect("/dashboard")
      } else {
        redirect("/login")
      }
    }
  }, [user, isLoading])

  // Show loading state while checking auth
  return (
    <div className="flex items-center justify-center h-screen">
      <Loading size="lg" />
    </div>
  )
}

