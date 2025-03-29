"use client"

import * as React from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getUserPlanInfo, getPlanDetails } from "@/lib/plan-limits"
import { useAuth } from "@/contexts/auth-context"

interface UsageData {
  current: number
  limit: number
  percentage: number
}

interface PlanUsageState {
  jobs: UsageData
  resumeUploads: UsageData
}

export function PlanUsageIndicator() {
  const { user } = useAuth()
  const [loading, setLoading] = React.useState(true)
  const [planName, setPlanName] = React.useState("")
  const [usageData, setUsageData] = React.useState<PlanUsageState>({
    jobs: { current: 0, limit: 0, percentage: 0 },
    resumeUploads: { current: 0, limit: 0, percentage: 0 },
  })

  React.useEffect(() => {
    async function fetchPlanData() {
      if (!user) return

      try {
        setLoading(true)
        const userPlan = await getUserPlanInfo(user.id)

        if (!userPlan) {
          throw new Error("User plan not found")
        }

        const planDetails = await getPlanDetails(userPlan.plan_id)

        if (!planDetails) {
          throw new Error("Plan details not found")
        }

        setPlanName(planDetails.name)

        setUsageData({
          jobs: {
            current: userPlan.usage.jobs_count,
            limit: planDetails.limits.max_jobs,
            percentage: Math.min(100, Math.round((userPlan.usage.jobs_count / planDetails.limits.max_jobs) * 100)),
          },
          resumeUploads: {
            current: userPlan.usage.resume_uploads_count,
            limit: planDetails.limits.max_resume_uploads_per_month,
            percentage: Math.min(
              100,
              Math.round((userPlan.usage.resume_uploads_count / planDetails.limits.max_resume_uploads_per_month) * 100),
            ),
          },
        })
      } catch (error) {
        console.error("Error fetching plan data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlanData()
  }, [user])

  if (loading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg"></div>
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between">
          <span>Plan Usage ({planName})</span>
          {planName === "Free" && (
            <Button variant="outline" size="sm" className="text-[#A23FC6]">
              Upgrade to Paid
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Jobs Posted</span>
            <span>
              {usageData.jobs.current} / {usageData.jobs.limit}
            </span>
          </div>
          <Progress value={usageData.jobs.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {planName === "Free" ? "Free plan: 2 active jobs" : "Paid plan: 5 active jobs"}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Resume Uploads (Monthly)</span>
            <span>
              {usageData.resumeUploads.current} / {usageData.resumeUploads.limit}
            </span>
          </div>
          <Progress value={usageData.resumeUploads.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {planName === "Free" 
              ? "Free plan: 100 resume uploads per month" 
              : "Paid plan: 250 resume uploads per month"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 