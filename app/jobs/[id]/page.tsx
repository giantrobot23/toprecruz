"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

export default function JobDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    async function fetchJob() {
      try {
        setLoading(true)
        const { data, error } = await supabase.from("jobs").select("*").eq("id", id).single()

        if (error) throw error

        setJob(data)
      } catch (err) {
        console.error("Error fetching job:", err)
        setError("Failed to load job details")
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [id])

  const handleCloseJob = async () => {
    if (!job) return

    try {
      setIsClosing(true)

      const { error } = await supabase
        .from("jobs")
        .update({
          status: "Closed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id)

      if (error) throw error

      toast({
        title: "Job closed",
        description: "The job has been closed successfully.",
      })

      // Update local state
      setJob({ ...job, status: "Closed" })
    } catch (error) {
      console.error("Error closing job:", error)
      toast({
        title: "Error",
        description: "Failed to close the job. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsClosing(false)
    }
  }

  const handleEditJob = () => {
    router.push(`/jobs/edit/${id}`)
  }

  if (loading)
    return (
      <div className="container px-4 md:px-6 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/jobs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
        <div className="h-screen flex items-center justify-center">
          <p>Loading job details...</p>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="container px-4 md:px-6 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/jobs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
        <div className="h-screen flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )

  if (!job)
    return (
      <div className="container px-4 md:px-6 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/jobs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
        <div className="h-screen flex items-center justify-center">
          <p>Job not found</p>
        </div>
      </div>
    )

  return (
    <div className="container px-4 md:px-6 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/jobs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{job.title}</h1>
        <Badge
          variant="outline"
          className={job.status === "Open" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
        >
          {job.status || "Open"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <p>{job.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.requirements }} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.responsibilities }} />
            </CardContent>
          </Card>

          {job.benefits && (
            <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.benefits }} />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
                <p>{job.department || "Not specified"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                <p>{job.location || "Remote"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Employment Type</h3>
                <p>{job.employment_type || "Full-time"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Experience Level</h3>
                <p>{job.experience_level || "Not specified"}</p>
              </div>
              {job.salary_range && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Salary Range</h3>
                  <p>{job.salary_range}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Posted On</h3>
                <p>{new Date(job.created_at).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/resume-upload?job=${job.id}`}>
                <Button className="w-full bg-[#A23FC6] hover:bg-[#B56FD1] text-white">Upload Resumes</Button>
              </Link>
              <Button variant="outline" className="w-full" onClick={handleEditJob}>
                Edit Job
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCloseJob}
                disabled={job.status === "Closed" || isClosing}
              >
                {isClosing ? "Closing..." : job.status === "Closed" ? "Job Closed" : "Close Job"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

