"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { supabase } from "@/lib/supabase"
import { getSignedResumeUrl } from "@/lib/storage"
import { toast } from "@/hooks/use-toast"

export default function CandidateDetailPage() {
  const { id } = useParams()
  const [candidate, setCandidate] = useState<any>(null)
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCandidate() {
      try {
        // Fetch candidate with job details
        const { data, error } = await supabase
          .from("candidates")
          .select(`
            *,
            jobs:job_id (
              id,
              title,
              department,
              location
            )
          `)
          .eq("id", id)
          .single()

        if (error) throw error

        setCandidate(data)
        setJob(data.jobs)
      } catch (err) {
        console.error("Error fetching candidate:", err)
        setError("Failed to load candidate details")
      } finally {
        setLoading(false)
      }
    }

    fetchCandidate()
  }, [id])

  const handleViewResume = async () => {
    if (!candidate?.resume_url) {
      toast({
        title: "No resume available",
        description: "This candidate does not have a resume uploaded.",
        variant: "destructive",
      })
      return
    }

    try {
      // Generate a signed URL with 5 minutes expiration
      const { signedUrl, error } = await getSignedResumeUrl(candidate.resume_url, 300)

      if (error) {
        toast({
          title: "Error accessing resume",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      // Open the signed URL in a new tab
      if (signedUrl) {
        window.open(signedUrl, "_blank")
      }
    } catch (err) {
      toast({
        title: "Error accessing resume",
        description: "Failed to generate secure access link for this resume.",
        variant: "destructive",
      })
      console.error(err)
    }
  }

  if (loading)
    return (
      <DashboardLayout>
        <div className="container px-4 md:px-6 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <Link href="/candidates">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Candidates
              </Button>
            </Link>
          </div>
          <div className="h-screen flex items-center justify-center">
            <p>Loading candidate details...</p>
          </div>
        </div>
      </DashboardLayout>
    )

  if (error)
    return (
      <DashboardLayout>
        <div className="container px-4 md:px-6 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <Link href="/candidates">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Candidates
              </Button>
            </Link>
          </div>
          <div className="h-screen flex items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    )

  if (!candidate)
    return (
      <DashboardLayout>
        <div className="container px-4 md:px-6 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <Link href="/candidates">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Candidates
              </Button>
            </Link>
          </div>
          <div className="h-screen flex items-center justify-center">
            <p>Candidate not found</p>
          </div>
        </div>
      </DashboardLayout>
    )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800"
      case "Reviewed":
        return "bg-purple-100 text-purple-800"
      case "Shortlisted":
        return "bg-green-100 text-green-800"
      case "Interviewed":
        return "bg-amber-100 text-amber-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <DashboardLayout>
      <div className="container px-4 md:px-6 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/candidates">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Candidates
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{candidate.name}</h1>
          <Badge variant="outline" className={getStatusColor(candidate.status)}>
            {candidate.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Candidate Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                    <p>{candidate.email}</p>
                  </div>
                  {candidate.phone && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                      <p>{candidate.phone}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Applied For</h3>
                    <p>{job?.title || "Unknown Position"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Match Score</h3>
                    <div className="flex items-center">
                      <span
                        className={`font-medium ${
                          candidate.match_score >= 90
                            ? "text-green-600"
                            : candidate.match_score >= 80
                              ? "text-blue-600"
                              : candidate.match_score >= 70
                                ? "text-amber-600"
                                : "text-red-600"
                        }`}
                      >
                        {candidate.match_score}%
                      </span>
                    </div>
                  </div>
                </div>

                {candidate.skills && candidate.skills.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-primary/10">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {candidate.resume_url && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Resume</h3>
                    <Button onClick={handleViewResume} className="gap-2">
                      <Download className="h-4 w-4" />
                      View Resume
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional sections like notes, interview feedback, etc. can be added here */}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Position</h3>
                  <p>{job?.title || "Unknown Position"}</p>
                </div>
                {job?.department && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
                    <p>{job.department}</p>
                  </div>
                )}
                {job?.location && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                    <p>{job.location}</p>
                  </div>
                )}
                <div className="pt-2">
                  <Link href={`/jobs/${job?.id}`}>
                    <Button variant="outline" size="sm">
                      View Full Job Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full bg-[#A23FC6] hover:bg-[#B56FD1] text-white">Schedule Interview</Button>
                <Button variant="outline" className="w-full">
                  Change Status
                </Button>
                <Button variant="outline" className="w-full">
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

