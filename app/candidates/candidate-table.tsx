"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, Eye, MoreHorizontal, Trash } from "lucide-react"
import Link from "next/link"
import type { Candidate } from "./page"

interface CandidateTableProps {
  candidates: Candidate[]
  loading: boolean
  selectedCandidates: string[]
  setSelectedCandidates: (ids: string[]) => void
  onView: (candidate: Candidate) => void
  onEdit: (candidate: Candidate) => void
  onDelete: (candidate: Candidate) => void
}

export function CandidateTable({
  candidates,
  loading,
  selectedCandidates,
  setSelectedCandidates,
  onView,
  onEdit,
  onDelete,
}: CandidateTableProps) {
  const toggleSelectAll = () => {
    if (selectedCandidates.length === candidates.length) {
      setSelectedCandidates([])
    } else {
      setSelectedCandidates(candidates.map((c) => c.id))
    }
  }

  const toggleSelectCandidate = (id: string) => {
    if (selectedCandidates.includes(id)) {
      setSelectedCandidates(selectedCandidates.filter((cid) => cid !== id))
    } else {
      setSelectedCandidates([...selectedCandidates, id])
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
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle">
                <Checkbox
                  checked={selectedCandidates.length > 0 && selectedCandidates.length === candidates.length}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all candidates"
                />
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Position</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Match</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-4 text-center">
                  Loading candidates...
                </td>
              </tr>
            ) : candidates.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center">
                  No candidates found. Try adjusting your filters or upload new resumes.
                </td>
              </tr>
            ) : (
              candidates.map((candidate) => (
                <tr
                  key={candidate.id}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  <td className="p-4 align-middle">
                    <Checkbox
                      checked={selectedCandidates.includes(candidate.id)}
                      onCheckedChange={() => toggleSelectCandidate(candidate.id)}
                      aria-label={`Select ${candidate.first_name} ${candidate.last_name}`}
                    />
                  </td>
                  <td className="p-4 align-middle font-medium">
                    <Link href={`/candidates/${candidate.id}`} className="hover:underline text-[#A23FC6]">
                      {candidate.first_name} {candidate.last_name}
                    </Link>
                  </td>
                  <td className="p-4 align-middle">{candidate.email}</td>
                  <td className="p-4 align-middle">{candidate.job?.title || "Unknown"}</td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getMatchScoreColor(candidate.match_score)}>
                        {candidate.match_score}%
                      </Badge>
                      <div className="w-16 h-2 bg-gray-200 rounded-full hidden md:block">
                        <div
                          className="h-full bg-[#A23FC6] rounded-full"
                          style={{ width: `${candidate.match_score}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <Badge variant="outline" className={getStatusColor(candidate.status)}>
                      {candidate.status}
                    </Badge>
                  </td>
                  <td className="p-4 align-middle">{new Date(candidate.created_at).toLocaleDateString()}</td>
                  <td className="p-4 align-middle">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal size={16} />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(candidate)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(candidate)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(candidate)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between p-4">
        <div className="text-sm text-muted-foreground">
          {candidates.length > 0
            ? `Showing ${candidates.length} candidate${candidates.length !== 1 ? "s" : ""}`
            : "No candidates found"}
        </div>
      </div>
    </div>
  )
}

