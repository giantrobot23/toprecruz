"use client"

import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface CandidateFiltersProps {
  jobs: { id: string; title: string }[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedJob: string | null
  setSelectedJob: (jobId: string | null) => void
  selectedMatchScore: string | null
  setSelectedMatchScore: (score: string | null) => void
  selectedStatus: string | null
  setSelectedStatus: (status: string | null) => void
}

export function CandidateFilters({
  jobs,
  searchQuery,
  setSearchQuery,
  selectedJob,
  setSelectedJob,
  selectedMatchScore,
  setSelectedMatchScore,
  selectedStatus,
  setSelectedStatus,
}: CandidateFiltersProps) {
  const clearFilters = () => {
    setSearchQuery("")
    setSelectedJob(null)
    setSelectedMatchScore(null) // Reset to "Any Score"
    setSelectedStatus(null)
  }

  const hasActiveFilters = searchQuery || selectedJob || selectedMatchScore || selectedStatus

  return (
    <CardContent className="p-4 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search candidates by name or email..."
            className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchQuery("")}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Job Position</label>
          <Select value={selectedJob || ""} onValueChange={(value) => setSelectedJob(value === "all" ? null : value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Positions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Match Score</label>
          <Select
            value={selectedMatchScore || ""}
            onValueChange={(value) => setSelectedMatchScore(value === "any" ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any Score" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Score</SelectItem>
              <SelectItem value="90">90% or higher</SelectItem>
              <SelectItem value="80">80% or higher</SelectItem>
              <SelectItem value="70">70% or higher</SelectItem>
              <SelectItem value="60">60% or higher</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Status</label>
          <Select
            value={selectedStatus || ""}
            onValueChange={(value) => setSelectedStatus(value === "all" ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Reviewed">Reviewed</SelectItem>
              <SelectItem value="Shortlisted">Shortlisted</SelectItem>
              <SelectItem value="Interviewed">Interviewed</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button variant="outline" className="w-full" onClick={clearFilters} disabled={!hasActiveFilters}>
            Clear Filters
          </Button>
        </div>
      </div>
    </CardContent>
  )
}

