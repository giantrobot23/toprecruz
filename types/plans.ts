export interface Plan {
  id: string
  name: string
  price: number
  billing_period: "monthly" | "yearly"
  limits: {
    max_jobs: number
    max_resume_uploads_per_month: number
  }
  features: string[]
}

export interface UserPlanInfo {
  plan_id: string
  plan_started_at: string
  plan_expires_at: string | null
  usage: {
    jobs_count: number
    resume_uploads_count: number
  }
  usage_period_start: string // Reset monthly counters from this date
} 