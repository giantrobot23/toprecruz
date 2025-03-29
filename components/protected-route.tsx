"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window !== "undefined") {
      if (!isLoading && !user) {
        router.push("/login")
      }
      setIsChecking(false)
    }
  }, [user, isLoading, router])

  // Show loading state while checking auth
  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A23FC6]"></div>
      </div>
    )
  }

  // If not authenticated, render nothing (redirect will happen in useEffect)
  if (!user) {
    return null
  }

  // If authenticated, render children
  return <>{children}</>
}

