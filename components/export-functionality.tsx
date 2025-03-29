"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Download, FileSpreadsheet, FileText } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { getSignedResumeUrl } from "@/lib/storage"

// Available fields for export
const exportableFields = [
  { id: "name", label: "Name" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "job", label: "Job Applied" },
  { id: "matchScore", label: "Match Score" },
  { id: "status", label: "Status" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "resumeUrl", label: "Resume Link" },
]

export default function ExportFunctionality({
  selectedCandidates = [],
  onExportComplete,
}: {
  selectedCandidates?: string[]
  onExportComplete?: () => void
}) {
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf" | null>(null)
  const [selectedFields, setSelectedFields] = useState(exportableFields.map((field) => field.id))
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)

    try {
      // Fetch candidates from Supabase
      let query = supabase.from("candidates").select(`
        id,
        name,
        email,
        phone,
        match_score,
        status,
        skills,
        resume_url,
        jobs:job_id (title)
      `)

      // Filter by selected candidates if any
      if (selectedCandidates.length > 0) {
        query = query.in("id", selectedCandidates)
      }

      const { data: candidates, error } = await query

      if (error) {
        throw error
      }

      // Process candidates for export
      const processedCandidates = await Promise.all(
        candidates.map(async (candidate) => {
          // Generate signed URLs for resumes if needed
          let resumeUrl = ""
          if (selectedFields.includes("resumeUrl") && candidate.resume_url) {
            try {
              const { signedUrl } = await getSignedResumeUrl(candidate.resume_url, 86400) // 24 hours
              resumeUrl = signedUrl || ""
            } catch (error) {
              console.error("Error generating signed URL:", error)
            }
          }

          return {
            name: candidate.name,
            email: candidate.email,
            phone: candidate.phone || "",
            job: candidate.jobs?.title || "",
            matchScore: candidate.match_score,
            status: candidate.status,
            skills: Array.isArray(candidate.skills) ? candidate.skills.join(", ") : "",
            experience: "", // Not stored in our current schema
            education: "", // Not stored in our current schema
            resumeUrl,
          }
        }),
      )

      // Generate CSV data
      if (exportFormat === "csv") {
        // Create CSV header row based on selected fields
        const headers = exportableFields
          .filter((field) => selectedFields.includes(field.id))
          .map((field) => field.label)
          .join(",")

        // Create CSV data rows
        const rows = processedCandidates
          .map((candidate) => {
            return selectedFields
              .map((field) => {
                const value = candidate[field as keyof typeof candidate] || ""
                // Escape commas and quotes in CSV
                return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
              })
              .join(",")
          })
          .join("\n")

        // Combine header and rows
        const csvContent = `${headers}\n${rows}`

        // Create and download the file
        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `toprecruz-candidates-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else if (exportFormat === "pdf") {
        // In a real app, you would generate a PDF file
        // This is a simplified example that just shows a toast
        toast({
          title: "PDF Export",
          description: `PDF with ${processedCandidates.length} candidates would be generated here`,
        })
      }

      toast({
        title: "Export Complete",
        description: `Successfully exported ${processedCandidates.length} candidates as ${exportFormat?.toUpperCase()}`,
      })

      setExportDialogOpen(false)
      if (onExportComplete) onExportComplete()
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const toggleField = (fieldId: string) => {
    if (selectedFields.includes(fieldId)) {
      setSelectedFields(selectedFields.filter((id) => id !== fieldId))
    } else {
      setSelectedFields([...selectedFields, fieldId])
    }
  }

  const handleExportClick = (format: "csv" | "pdf") => {
    setExportFormat(format)
    setExportDialogOpen(true)
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Export Format</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleExportClick("csv")} className="gap-2">
            <FileSpreadsheet size={16} />
            CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExportClick("pdf")} className="gap-2">
            <FileText size={16} />
            PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Candidates</DialogTitle>
            <DialogDescription>
              {exportFormat === "csv"
                ? "Select the fields you want to include in your CSV export."
                : "Select the fields you want to include in your PDF export."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            {exportableFields.map((field) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`field-${field.id}`}
                  checked={selectedFields.includes(field.id)}
                  onCheckedChange={() => toggleField(field.id)}
                />
                <label
                  htmlFor={`field-${field.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {field.label}
                </label>
              </div>
            ))}
          </div>

          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              Exporting {selectedCandidates.length > 0 ? selectedCandidates.length : "all"} candidate
              {selectedCandidates.length !== 1 ? "s" : ""} as {exportFormat?.toUpperCase()}
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting || selectedFields.length === 0}>
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

