import { supabase } from "@/lib/supabase"
import type { Plan, UserPlanInfo } from "@/types/plans"

/**
 * Get the user's current plan information
 */
export async function getUserPlanInfo(userId: string): Promise<UserPlanInfo | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("plan_id, plan_started_at, plan_expires_at, usage, usage_period_start")
      .eq("id", userId)
      .single()

    if (error) throw error
    return data as UserPlanInfo
  } catch (error) {
    console.error("Error fetching user plan info:", error)
    return null
  }
}

/**
 * Get plan details by plan ID
 */
export async function getPlanDetails(planId: string): Promise<Plan | null> {
  try {
    const { data, error } = await supabase.from("plans").select("*").eq("id", planId).single()

    if (error) throw error
    return data as Plan
  } catch (error) {
    console.error("Error fetching plan details:", error)
    return null
  }
}

/**
 * Check if user has reached their limit for a specific resource
 */
export async function checkResourceLimit(
  userId: string,
  resourceType: "jobs" | "resume_uploads"
): Promise<{ allowed: boolean; current: number; limit: number; message?: string }> {
  try {
    // Get user's plan info
    const userPlan = await getUserPlanInfo(userId)
    if (!userPlan) {
      throw new Error("User plan information not found")
    }

    // Get plan details
    const planDetails = await getPlanDetails(userPlan.plan_id)
    if (!planDetails) {
      throw new Error("Plan details not found")
    }

    // Check if monthly counters need to be reset
    const now = new Date()
    const usagePeriodStart = new Date(userPlan.usage_period_start)
    const monthsSinceReset =
      (now.getFullYear() - usagePeriodStart.getFullYear()) * 12 + now.getMonth() - usagePeriodStart.getMonth()

    if (monthsSinceReset > 0) {
      // Reset monthly counters
      await supabase
        .from("profiles")
        .update({
          usage: {
            ...userPlan.usage,
            resume_uploads_count: 0,
          },
          usage_period_start: now.toISOString(),
        })
        .eq("id", userId)

      // Refresh user plan info
      userPlan.usage.resume_uploads_count = 0
    }

    // Determine current usage and limit based on resource type
    let current = 0
    let limit = 0

    switch (resourceType) {
      case "jobs":
        current = userPlan.usage.jobs_count
        limit = planDetails.limits.max_jobs
        break
      case "resume_uploads":
        current = userPlan.usage.resume_uploads_count
        limit = planDetails.limits.max_resume_uploads_per_month
        break
    }

    const allowed = current < limit

    return {
      allowed,
      current,
      limit,
      message: allowed
        ? undefined
        : `You've reached your ${resourceType.replace("_", " ")} limit. Please upgrade your plan for more.`,
    }
  } catch (error) {
    console.error(`Error checking ${resourceType} limit:`, error)
    // Default to allowing the operation if there's an error checking limits
    return { allowed: true, current: 0, limit: 0 }
  }
}

/**
 * Increment usage counter for a specific resource
 */
export async function incrementUsageCounter(
  userId: string,
  resourceType: "jobs" | "resume_uploads"
): Promise<boolean> {
  try {
    const userPlan = await getUserPlanInfo(userId)
    if (!userPlan) return false

    const updatedUsage = { ...userPlan.usage }

    switch (resourceType) {
      case "jobs":
        updatedUsage.jobs_count += 1
        break
      case "resume_uploads":
        updatedUsage.resume_uploads_count += 1
        break
    }

    const { error } = await supabase.from("profiles").update({ usage: updatedUsage }).eq("id", userId)

    return !error
  } catch (error) {
    console.error(`Error incrementing ${resourceType} usage:`, error)
    return false
  }
} 