"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Filter, Plus, Search } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

export default function JobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setJobs(data || [])
      } catch (error) {
        console.error("Error fetching jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [user])

  return (
    <div className="container px-4 md:px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">Manage your job listings and openings.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/jobs/create">
            <Button className="bg-[#A23FC6] hover:bg-[#B56FD1] text-white gap-2">
              <Plus size={16} />
              Create Job
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle>Job Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search jobs..."
                className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter size={16} />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <div className="p-4">
          <h2 className="text-lg font-semibold">Active Jobs</h2>
        </div>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Department</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Location</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Candidates</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center">
                    Loading jobs...
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center">
                    No jobs found. Create your first job!
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle">{job.title}</td>
                    <td className="p-4 align-middle">{job.department || "N/A"}</td>
                    <td className="p-4 align-middle">{job.location || "Remote"}</td>
                    <td className="p-4 align-middle">
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {job.status || "Open"}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">0</td>
                    <td className="p-4 align-middle">
                      <Link href={`/jobs/${job.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ExternalLink size={16} />
                          <span className="sr-only">View</span>
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {jobs.length > 0 && (
          <div className="flex items-center justify-between p-4">
            <div className="text-sm text-muted-foreground">Showing {jobs.length} job(s)</div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={jobs.length < 10}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

