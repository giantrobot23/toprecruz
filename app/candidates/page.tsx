"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Download } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { CandidateFilters } from "./candidate-filters"
import { CandidateTable } from "./candidate-table"
import { CandidateViewModal } from "./candidate-view-modal"
import { CandidateEditModal } from "./candidate-edit-modal"
import { DeleteConfirmationModal } from "./delete-confirmation-modal"
import { BulkActionBar } from "./bulk-action-bar"
import { getSignedResumeUrl } from "@/lib/storage"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useRouter } from "next/navigation"

// Update the Candidate interface to include all AI-parsed data fields
export interface Candidate {
  id: string
  first_name: string // Changed from name to first_name
  last_name: string
  email: string
  phone?: string
  job_id: string
  match_score: number
  status: string
  skills?: string[]
  experience?: string[]
  education?: string[]
  summary?: string
  matched_skills?: string[]
  missing_skills?: string[]
  notes?: string
  resume_url?: string
  created_at: string
  updated_at: string
  job?: {
    id: string
    title: string
  }
}

export default function CandidatesPage() {
  const { user } = useAuth()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([])
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [isDownloading, setIsDownloading] = useState(false)

  // Modal states
  const [viewCandidate, setViewCandidate] = useState<Candidate | null>(null)
  const [editCandidate, setEditCandidate] = useState<Candidate | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<Candidate | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [selectedMatchScore, setSelectedMatchScore] = useState<string | null>(null) // Changed to null for "Any score"
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  const router = useRouter()

  // Update the fetchData function to sort by match score
  const fetchData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Fetch jobs for the filter dropdown
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("id, title")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (jobsError) throw jobsError
      setJobs(jobsData || [])

      // Build the query
      let query = supabase
        .from("candidates")
        .select(`
          *,
          job:job_id (
            id,
            title
          )
        `)
        .eq("user_id", user.id)

      // Apply filters in the query if they exist
      if (selectedJob) {
        query = query.eq("job_id", selectedJob)
      }

      if (selectedMatchScore) {
        const score = parseInt(selectedMatchScore)
        query = query.gte("match_score", score)
      }

      if (selectedStatus) {
        query = query.eq("status", selectedStatus)
      }

      // Add sorting
      query = query.order("match_score", { ascending: false })
                  .order("created_at", { ascending: false })

      // Execute the query
      const { data: candidatesData, error: candidatesError } = await query

      if (candidatesError) throw candidatesError

      // Transform the data to match our interface
      const formattedCandidates = (candidatesData || []).map((candidate) => ({
        ...candidate,
        job: candidate.job,
        skills: candidate.skills || [],
        experience: candidate.experience || [],
        education: candidate.education || [],
        matched_skills: candidate.matched_skills || [],
        missing_skills: candidate.missing_skills || [],
      }))

      setCandidates(formattedCandidates)
      setFilteredCandidates(formattedCandidates)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load candidates. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Update useEffect to include filter dependencies
  useEffect(() => {
    fetchData()
  }, [user, selectedJob, selectedMatchScore, selectedStatus])

  // Update the filter function to only handle search
  const applyFilters = () => {
    let filtered = [...candidates]

    // Only apply search filter client-side
    if (searchQuery) {
      filtered = filtered.filter(
        (candidate) =>
          (candidate.first_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
          (candidate.last_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
          (candidate.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredCandidates(filtered)
  }

  // Update effect for search filter only
  useEffect(() => {
    applyFilters()
  }, [searchQuery, candidates])

  // Update the match score filter options
  const matchScoreOptions = [
    { value: null, label: "Any score" },
    { value: "90", label: "90% or higher" },
    { value: "80", label: "80% or higher" },
    { value: "70", label: "70% or higher" },
    { value: "60", label: "60% or higher" },
  ]

  const handleViewCandidate = (candidate: Candidate) => {
    router.push(`/candidates/${candidate.id}`)
  }

  const handleEditCandidate = (candidate: Candidate) => {
    setEditCandidate(candidate)
  }

  const handleDeleteCandidate = (candidate: Candidate) => {
    setDeleteCandidate(candidate)
  }

  const confirmDeleteCandidate = async () => {
    if (!deleteCandidate) return

    try {
      const { error } = await supabase.from("candidates").delete().eq("id", deleteCandidate.id)

      if (error) throw error

      // Update local state
      setCandidates(candidates.filter((c) => c.id !== deleteCandidate.id))
      setFilteredCandidates(filteredCandidates.filter((c) => c.id !== deleteCandidate.id))

      toast({
        title: "Candidate deleted",
        description: "The candidate has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting candidate:", error)
      toast({
        title: "Error",
        description: "Failed to delete candidate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteCandidate(null)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedCandidates.length === 0) return

    try {
      const { error } = await supabase.from("candidates").delete().in("id", selectedCandidates)

      if (error) throw error

      // Update local state
      setCandidates(candidates.filter((c) => !selectedCandidates.includes(c.id)))
      setFilteredCandidates(filteredCandidates.filter((c) => !selectedCandidates.includes(c.id)))

      toast({
        title: "Candidates deleted",
        description: `${selectedCandidates.length} candidates have been deleted successfully.`,
      })

      // Reset selection
      setSelectedCandidates([])
    } catch (error) {
      console.error("Error deleting candidates:", error)
      toast({
        title: "Error",
        description: "Failed to delete candidates. Please try again.",
        variant: "destructive",
      })
    } finally {
      setBulkDeleteOpen(false)
    }
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedCandidates.length === 0) return

    try {
      const { error } = await supabase
        .from("candidates")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .in("id", selectedCandidates)

      if (error) throw error

      // Update local state
      const updatedCandidates = candidates.map((candidate) =>
        selectedCandidates.includes(candidate.id) ? { ...candidate, status: newStatus } : candidate,
      )

      setCandidates(updatedCandidates)
      setFilteredCandidates(
        filteredCandidates.map((candidate) =>
          selectedCandidates.includes(candidate.id) ? { ...candidate, status: newStatus } : candidate,
        ),
      )

      toast({
        title: "Status updated",
        description: `${selectedCandidates.length} candidates have been updated to "${newStatus}".`,
      })

      // Reset selection
      setSelectedCandidates([])
    } catch (error) {
      console.error("Error updating candidates:", error)
      toast({
        title: "Error",
        description: "Failed to update candidates. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveEdit = async (updatedCandidate: Partial<Candidate>) => {
    if (!editCandidate) return

    try {
      const { error } = await supabase
        .from("candidates")
        .update({
          ...updatedCandidate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editCandidate.id)

      if (error) throw error

      // Update local state
      const updatedCandidates = candidates.map((candidate) =>
        candidate.id === editCandidate.id ? { ...candidate, ...updatedCandidate } : candidate,
      )

      setCandidates(updatedCandidates)
      setFilteredCandidates(
        filteredCandidates.map((candidate) =>
          candidate.id === editCandidate.id ? { ...candidate, ...updatedCandidate } : candidate,
        ),
      )

      toast({
        title: "Candidate updated",
        description: "The candidate has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating candidate:", error)
      toast({
        title: "Error",
        description: "Failed to update candidate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setEditCandidate(null)
    }
  }

  const handleBulkDownloadResumes = async () => {
    if (selectedCandidates.length === 0) {
      toast({
        title: "No candidates selected",
        description: "Please select at least one candidate to download resumes.",
        variant: "destructive",
      })
      return
    }

    setIsDownloading(true)

    try {
      // Get selected candidates with resume URLs
      const selectedCandidatesWithResumes = candidates.filter((c) => selectedCandidates.includes(c.id) && c.resume_url)

      if (selectedCandidatesWithResumes.length === 0) {
        toast({
          title: "No resumes available",
          description: "None of the selected candidates have resumes to download.",
          variant: "destructive",
        })
        return
      }

      // Generate signed URLs for each resume
      for (const candidate of selectedCandidatesWithResumes) {
        if (candidate.resume_url) {
          const { signedUrl, error } = await getSignedResumeUrl(candidate.resume_url, 300) // 5 minutes expiration

          if (error || !signedUrl) {
            console.error(`Error generating URL for ${candidate.first_name}:`, error)
            continue
          }

          // Open the URL in a new tab
          window.open(signedUrl, "_blank")
        }
      }

      toast({
        title: "Resumes downloaded",
        description: `Opened ${selectedCandidatesWithResumes.length} resume(s) in new tabs.`,
      })
    } catch (error) {
      console.error("Error downloading resumes:", error)
      toast({
        title: "Download failed",
        description: "Failed to download resumes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="container px-4 md:px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground">Manage and track your candidate pipeline.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/resume-upload">
            <Button className="bg-[#A23FC6] hover:bg-[#B56FD1] text-white gap-2">
              <Plus size={16} />
              Add Candidates
            </Button>
          </Link>
          {selectedCandidates.length > 0 && (
            <Button variant="outline" className="gap-2" onClick={handleBulkDownloadResumes} disabled={isDownloading}>
              <Download size={16} />
              {isDownloading ? "Downloading..." : "Download Resumes"}
            </Button>
          )}
        </div>
      </div>

      <Card className="mb-8">
        <CandidateFilters
          jobs={jobs}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedJob={selectedJob}
          setSelectedJob={setSelectedJob}
          selectedMatchScore={selectedMatchScore}
          setSelectedMatchScore={setSelectedMatchScore}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />
      </Card>

      {selectedCandidates.length > 0 && (
        <BulkActionBar
          selectedCount={selectedCandidates.length}
          onStatusUpdate={handleBulkStatusUpdate}
          onDelete={() => setBulkDeleteOpen(true)}
        />
      )}

      <CandidateTable
        candidates={filteredCandidates}
        loading={loading}
        selectedCandidates={selectedCandidates}
        setSelectedCandidates={setSelectedCandidates}
        onView={handleViewCandidate}
        onEdit={handleEditCandidate}
        onDelete={handleDeleteCandidate}
      />

      {/* Modals */}
      {editCandidate && (
        <CandidateEditModal
          candidate={editCandidate}
          open={!!editCandidate}
          onClose={() => setEditCandidate(null)}
          onSave={handleSaveEdit}
        />
      )}

      <DeleteConfirmationModal
        open={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={confirmDeleteCandidate}
        title="Delete Candidate"
        description="Are you sure you want to delete this candidate? This action cannot be undone."
      />

      <DeleteConfirmationModal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title="Delete Multiple Candidates"
        description={`Are you sure you want to delete ${selectedCandidates.length} candidates? This action cannot be undone.`}
      />
    </div>
  )
}

