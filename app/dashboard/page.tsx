"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Briefcase, Calendar, CheckCircle, Plus, ThumbsUp, Upload, Users } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { PlanUsageIndicator } from "@/components/plan-usage-indicator"
import type { Database } from "@/types/supabase"

type Candidate = Database["public"]["Tables"]["candidates"]["Row"] & {
  jobs: Database["public"]["Tables"]["jobs"]["Row"] | null
}

type Job = Database["public"]["Tables"]["jobs"]["Row"]

type ActivityCandidate = {
  id: string
  first_name: string
  last_name: string
  status: string
  created_at: string
  jobs: {
    id: string
    title: string
    department: string | null
    status: string
  } | null
}

type ActivityJob = {
  id: string
  title: string
  department: string | null
  status: string
  created_at: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState({
    totalCandidates: 0,
    hiredThisMonth: 0,
    openJobs: 0,
    pendingReviews: 0,
    topMatches: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Fetch total candidates
        const { count: totalCandidates, error: candidatesError } = await supabase
          .from("candidates")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        if (candidatesError) throw new Error(candidatesError.message)

        // Fetch hired this month
        const currentDate = new Date()
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString()
        const { count: hiredThisMonth, error: hiredError } = await supabase
          .from("candidates")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "Hired")
          .gte("updated_at", firstDayOfMonth)

        if (hiredError) throw new Error(hiredError.message)

        // Fetch open jobs
        const { count: openJobs, error: jobsError } = await supabase
          .from("jobs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "Open")

        if (jobsError) throw new Error(jobsError.message)

        // Fetch pending reviews
        const { count: pendingReviews, error: reviewsError } = await supabase
          .from("candidates")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .in("status", ["New", "Reviewed"])

        if (reviewsError) throw new Error(reviewsError.message)

        // Fetch top matches this week
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const { count: topMatches, error: matchesError } = await supabase
          .from("candidates")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("match_score", 90)
          .gte("created_at", oneWeekAgo.toISOString())

        if (matchesError) throw new Error(matchesError.message)

        // Fetch recent activity
        const { data: recentCandidates, error: recentCandidatesError } = await supabase
          .from("candidates")
          .select(`
            id,
            first_name,
            last_name,
            email,
            phone,
            job_id,
            match_score,
            status,
            created_at,
            jobs:job_id (
              id,
              title,
              department,
              status
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5)

        if (recentCandidatesError) throw new Error(recentCandidatesError.message)

        const { data: recentJobs, error: recentJobsError } = await supabase
          .from("jobs")
          .select(`
            id,
            title,
            department,
            status,
            created_at
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5)

        if (recentJobsError) throw new Error(recentJobsError.message)

        // Combine and sort recent activity
        const combinedActivity = [
          ...((recentCandidates || []) as ActivityCandidate[]).map((candidate) => ({
            type: "candidate" as const,
            title: `New candidate applied`,
            description: `${candidate.first_name} ${candidate.last_name} • ${candidate.jobs?.title || "Unknown Position"}`,
            date: candidate.created_at,
            status: candidate.status,
          })),
          ...((recentJobs || []) as ActivityJob[]).map((job) => ({
            type: "job" as const,
            title: `Job posting created`,
            description: `${job.title} • ${job.status}`,
            date: job.created_at,
          })),
        ]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)

        setRecentActivity(combinedActivity)

        setMetrics({
          totalCandidates: totalCandidates || 0,
          hiredThisMonth: hiredThisMonth || 0,
          openJobs: openJobs || 0,
          pendingReviews: pendingReviews || 0,
          topMatches: topMatches || 0,
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError(error instanceof Error ? error.message : "Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  // Show loading state
  if (loading) {
    return (
      <div className="container px-4 md:px-6 py-8">
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="container px-4 md:px-6 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Function to animate numbers
  const AnimatedNumber = ({ value }: { value: number }) => {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
      if (loading) return

      let start = 0
      const end = value
      const duration = 1000
      const increment = end / (duration / 16)

      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setDisplayValue(end)
          clearInterval(timer)
        } else {
          setDisplayValue(Math.floor(start))
        }
      }, 16)

      return () => clearInterval(timer)
    }, [value, loading])

    return <>{displayValue}</>
  }

  return (
    <div className="container px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to TopRecruz, your AI-powered recruitment platform.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="w-5 h-5 text-[#A23FC6]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "..." : <AnimatedNumber value={metrics.totalCandidates} />}
            </div>
            <p className="text-xs text-muted-foreground">Candidates across all jobs</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Hired This Month</CardTitle>
            <CheckCircle className="w-5 h-5 text-[#A23FC6]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "..." : <AnimatedNumber value={metrics.hiredThisMonth} />}
            </div>
            <p className="text-xs text-muted-foreground">
              Candidates hired in {new Date().toLocaleString("default", { month: "long" })}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Open Jobs</CardTitle>
            <Briefcase className="w-5 h-5 text-[#A23FC6]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : <AnimatedNumber value={metrics.openJobs} />}</div>
            <p className="text-xs text-muted-foreground">Active job postings</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Calendar className="w-5 h-5 text-[#A23FC6]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "..." : <AnimatedNumber value={metrics.pendingReviews} />}
            </div>
            <p className="text-xs text-muted-foreground">Candidates awaiting review</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Top Matches This Week</CardTitle>
            <ThumbsUp className="w-5 h-5 text-[#A23FC6]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : <AnimatedNumber value={metrics.topMatches} />}</div>
            <p className="text-xs text-muted-foreground">Candidates with 90%+ match score</p>
          </CardContent>
        </Card>

        {/* Plan Usage Indicator */}
        <PlanUsageIndicator />

        <Card className="overflow-hidden transition-all hover:shadow-md md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Average Match Score</CardTitle>
            <BarChart3 className="w-5 h-5 text-[#A23FC6]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">76%</div>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
              <div className="h-full bg-[#A23FC6] rounded-full" style={{ width: "76%" }}></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Average AI match score across all candidates</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mt-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href="/jobs/create">
              <Button className="w-full bg-[#A23FC6] hover:bg-[#B56FD1] text-white flex items-center gap-2">
                <Plus size={16} />
                Create New Job
              </Button>
            </Link>
            <Link href="/resume-upload">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Upload size={16} />
                Upload Resumes
              </Button>
            </Link>
            <Link href="/candidates">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Users size={16} />
                View Candidates
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest recruitment activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-gray-300 mr-2"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))
              ) : recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        activity.type === "candidate"
                          ? activity.status === "New"
                            ? "bg-green-500"
                            : "bg-blue-500"
                          : "bg-purple-500"
                      }`}
                    ></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.description} • {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

