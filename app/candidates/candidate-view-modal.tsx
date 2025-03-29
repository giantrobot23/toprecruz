"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Candidate } from "./page"
import { Download, Edit } from "lucide-react"
import { useState } from "react"
import { getSignedResumeUrl } from "@/lib/storage"
import { toast } from "@/hooks/use-toast"

interface CandidateViewModalProps {
  candidate: Candidate
  open: boolean
  onClose: () => void
  onEdit: () => void
}

export function CandidateViewModal({ candidate, open, onClose, onEdit }: CandidateViewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleViewResume = async () => {
    if (!candidate.resume_url) {
      toast({
        title: "No resume available",
        description: "This candidate does not have a resume uploaded.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsDownloading(true)
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
    } finally {
      setIsDownloading(false)
    }
  }

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

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800"
    if (score >= 80) return "bg-blue-100 text-blue-800"
    if (score >= 70) return "bg-amber-100 text-amber-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {candidate.first_name} {candidate.last_name}
            <Badge variant="outline" className={getStatusColor(candidate.status)}>
              {candidate.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>Candidate for {candidate.job?.title || "Unknown Position"}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
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
                <h3 className="text-sm font-medium text-muted-foreground">Match Score</h3>
                <div className="flex items-center">
                  <Badge variant="outline" className={getMatchScoreColor(candidate.match_score)}>
                    {candidate.match_score}%
                  </Badge>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Applied On</h3>
                <p>{new Date(candidate.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {candidate.summary && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Summary</h3>
                <p className="text-sm">{candidate.summary}</p>
              </div>
            )}

            {candidate.skills && candidate.skills.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="bg-primary/10">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {candidate.experience && candidate.experience.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Experience</h3>
                <ul className="space-y-2 text-sm">
                  {candidate.experience.map((exp, index) => (
                    <li key={index} className="bg-muted p-2 rounded-md">
                      {exp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {candidate.education && candidate.education.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Education</h3>
                <ul className="space-y-2 text-sm">
                  {candidate.education.map((edu, index) => (
                    <li key={index} className="bg-muted p-2 rounded-md">
                      {edu}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Match Details</h3>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm">
                  This candidate matched on key skills required for the position. The AI-powered match score is based on
                  skills alignment, experience level, and overall profile fit.
                </p>
                <div className="mt-2">
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-[#A23FC6] rounded-full"
                      style={{ width: `${candidate.match_score}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
                {candidate.matched_skills && candidate.matched_skills.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium">Matched on:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {candidate.matched_skills.map((skill, i) => (
                        <Badge key={i} variant="outline" className="bg-green-50 text-green-700">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {candidate.missing_skills && candidate.missing_skills.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Missing skills:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {candidate.missing_skills.map((skill, i) => (
                        <Badge key={i} variant="outline" className="bg-red-50 text-red-700">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {candidate.notes && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                <div className="bg-muted p-3 rounded-md text-sm">{candidate.notes}</div>
              </div>
            )}

            {candidate.resume_url && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Resume</h3>
                <Button onClick={handleViewResume} className="gap-2" disabled={isDownloading}>
                  <Download className="h-4 w-4" />
                  {isDownloading ? "Loading..." : "View Resume"}
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onEdit} className="gap-2 bg-[#A23FC6] hover:bg-[#B56FD1] text-white">
            <Edit className="h-4 w-4" />
            Edit Candidate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

