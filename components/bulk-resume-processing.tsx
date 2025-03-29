"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { uploadResume } from "@/lib/storage"

interface BulkResumeProcessingProps {
  userId: string
  jobs: { id: string; title: string }[]
}

export function BulkResumeProcessing({ userId, jobs }: BulkResumeProcessingProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<string>("")
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<{
    success: number
    failed: number
    total: number
  }>({
    success: 0,
    failed: 0,
    total: 0,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleProcess = async () => {
    if (!selectedJob) {
      toast({
        title: "Job required",
        description: "Please select a job position for these candidates.",
        variant: "destructive",
      })
      return
    }

    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one resume file to process.",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)
    setProgress(0)
    setResults({
      success: 0,
      failed: 0,
      total: files.length,
    })

    let successCount = 0
    let failedCount = 0

    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i]

        // Upload the resume to storage
        const { path: filePath, error: uploadError } = await uploadResume(file, userId, file.name.split(".")[0])

        if (uploadError) throw uploadError

        // Mock AI parsing (in a real app, this would call the OpenAI API)
        const candidateName = file.name.split(".")[0].replace(/-/g, " ")
        const candidateEmail = `${candidateName.toLowerCase().replace(/\s+/g, ".")}@example.com`
        const skills = ["JavaScript", "React", "TypeScript", "Node.js", "HTML", "CSS"]
        const matchScore = Math.floor(Math.random() * 30) + 70 // Random score between 70-99

        // Save the candidate to the database
        const { error: insertError } = await supabase.from("candidates").insert({
          name: candidateName,
          email: candidateEmail,
          job_id: selectedJob,
          match_score: matchScore,
          status: "New",
          skills: skills,
          resume_url: filePath,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: userId,
        })

        if (insertError) throw insertError

        successCount++
      } catch (error) {
        console.error("Error processing resume:", error)
        failedCount++
      }

      // Update progress
      setProgress(Math.round(((i + 1) / files.length) * 100))
      setResults({
        success: successCount,
        failed: failedCount,
        total: files.length,
      })
    }

    // Complete
    setProcessing(false)

    if (successCount === files.length) {
      toast({
        title: "Processing complete",
        description: `Successfully processed all ${files.length} resumes.`,
      })
    } else {
      toast({
        title: "Processing complete with errors",
        description: `Processed ${successCount} of ${files.length} resumes successfully.`,
        variant: "destructive",
      })
    }
  }

  const handleComplete = () => {
    setOpen(false)
    router.push("/candidates")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Bulk Process Resumes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Resume Processing</DialogTitle>
          <DialogDescription>
            Upload multiple resumes to be processed by AI and added to your candidate database.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!processing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="job">Select Job Position</Label>
                <Select value={selectedJob} onValueChange={setSelectedJob}>
                  <SelectTrigger id="job">
                    <SelectValue placeholder="Select a job position" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="files">Select Resume Files</Label>
                <div className="border-2 border-dashed rounded-md p-4 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm mb-2">Drag and drop resume files here, or click to browse</p>
                  <input
                    id="files"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button variant="outline" size="sm" onClick={() => document.getElementById("files")?.click()}>
                    Browse Files
                  </Button>
                </div>
                {files.length > 0 && <p className="text-sm text-muted-foreground">{files.length} file(s) selected</p>}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing resumes...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="flex justify-center gap-4 py-2">
                <Badge variant="outline" className="bg-green-100 text-green-800 gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Success: {results.success}
                </Badge>
                <Badge variant="outline" className="bg-red-100 text-red-800 gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Failed: {results.failed}
                </Badge>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!processing ? (
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleProcess}
                className="bg-[#A23FC6] hover:bg-[#B56FD1] text-white"
                disabled={!selectedJob || files.length === 0}
              >
                Process Resumes
              </Button>
            </>
          ) : (
            <Button
              onClick={handleComplete}
              className="bg-[#A23FC6] hover:bg-[#B56FD1] text-white"
              disabled={progress < 100}
            >
              {progress < 100 ? "Processing..." : "View Candidates"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

