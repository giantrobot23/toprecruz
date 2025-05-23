"use client"

import Link from "next/link"
import type React from "react"
import { useEffect } from "react"
import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import { AlertCircle, FileText, UploadCloud } from "lucide-react"
import { UploadFeedback } from "./upload-feedback"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { uploadResume } from "@/lib/storage"

interface ResumeFile {
  id: string
  name: string
  size: number
  status: "uploading" | "parsing" | "success" | "error"
  progress: number
  error?: string
  parsedData?: {
    name?: string
    email?: string
    phone?: string
    skills?: string[]
    matchScore?: number
  }
}

export default function ResumeUploadClient() {
  const router = useRouter()
  const { user } = useAuth()
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([])
  const [selectedJob, setSelectedJob] = useState<string>("")
  const [jobRequirements, setJobRequirements] = useState<string>("")
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<ResumeFile[]>([])
  const [uploadStarted, setUploadStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch jobs from Supabase
  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("id, title")
          .eq("user_id", user.id)
          .eq("status", "Open")
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setJobs(data || [])
      } catch (error) {
        console.error("Error fetching jobs:", error)
        toast({
          title: "Error fetching jobs",
          description: "Could not load your job listings.",
          variant: "destructive",
        })
      }
    }

    fetchJobs()
  }, [user])

  // Fetch job requirements when job is selected
  useEffect(() => {
    const fetchJobRequirements = async () => {
      if (!selectedJob) return

      try {
        const { data, error } = await supabase.from("jobs").select("requirements").eq("id", selectedJob).single()

        if (error) {
          throw error
        }

        setJobRequirements(data?.requirements || "")
      } catch (error) {
        console.error("Error fetching job requirements:", error)
      }
    }

    fetchJobRequirements()
  }, [selectedJob])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const validateFiles = (fileList: FileList): { valid: File[]; invalid: { file: File; reason: string }[] } => {
    const validFiles: File[] = []
    const invalidFiles: { file: File; reason: string }[] = []

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ]
    const maxSize = 5 * 1024 * 1024 // 5MB

    Array.from(fileList).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        invalidFiles.push({
          file,
          reason: `Invalid file type. Supported formats: PDF, DOCX, DOC, TXT`,
        })
      } else if (file.size > maxSize) {
        invalidFiles.push({
          file,
          reason: `File too large. Maximum size: 5MB`,
        })
      } else {
        validFiles.push(file)
      }
    })

    return { valid: validFiles, invalid: invalidFiles }
  }

  const processFiles = (fileList: FileList) => {
    if (!selectedJob) {
      setError("Please select a job position before uploading resumes")
      return
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to upload resumes.",
        variant: "destructive",
      })
      return
    }

    const { valid, invalid } = validateFiles(fileList)

    if (invalid.length > 0) {
      setError(`${invalid.length} file(s) couldn't be uploaded. Please check file types and sizes.`)
    }

    if (valid.length === 0) {
      return
    }

    // Create file objects for tracking
    const newFiles = valid.map((file) => ({
      id: Math.random().toString(36).substring(2, 11),
      name: file.name,
      size: file.size,
      status: "uploading" as const,
      progress: 0,
      file: file, // Store the actual file for processing
    }))

    setFiles((prev) => [...prev, ...newFiles])
    setUploadStarted(true)

    // Process each file
    newFiles.forEach((fileObj) => {
      processFile(fileObj)
    })
  }

  const processFile = async (fileObj: ResumeFile & { file: File }) => {
    // Start with 0 progress
    setFiles((prev) => prev.map((f) => (f.id === fileObj.id ? { ...f, progress: 0 } : f)))

    // Simulate upload progress with smaller increments
    let progress = 0
    const uploadInterval = setInterval(() => {
      progress += 5
      setFiles((prev) => prev.map((f) => (f.id === fileObj.id ? { ...f, progress: Math.min(progress, 100) } : f)))

      // When upload completes, start parsing
      if (progress >= 100) {
        clearInterval(uploadInterval)

        setFiles((prev) => prev.map((f) => (f.id === fileObj.id ? { ...f, status: "parsing" } : f)))

        // Start the actual parsing process with a slight delay to show the parsing state
        setTimeout(() => {
          handleResumeProcessing(fileObj)
        }, 800)
      }
    }, 150)
  }

  const handleResumeProcessing = async (fileObj: ResumeFile & { file: File }) => {
    try {
      // 1. Upload file to Supabase Storage using our secure function
      const {
        path: filePath,
        url: resumeUrl,
        error: uploadError,
      } = await uploadResume(
        fileObj.file,
        user!.id,
        fileObj.name.split(".")[0], // Use filename as candidate name
      )

      if (uploadError) {
        throw new Error(`Upload error: ${uploadError.message}`)
      }

      // 2. Read file content for parsing
      let resumeText = ""

      if (fileObj.file.type === "text/plain") {
        resumeText = await fileObj.file.text()
      } else {
        // For PDF/DOCX, we'd normally use a server-side function to extract text
        // For this demo, we'll simulate with a placeholder
        resumeText = `Resume for ${fileObj.name.split(".")[0]}

      Skills: JavaScript, React, TypeScript, Node.js

      Experience: 5 years of frontend development

      Education: Bachelor's in Computer Science`
      }

      // 3. Parse resume with mock API - ensure this completes
      const parseResponse = await fetch("/api/ai/mock-resume-parser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeText }),
      })

      if (!parseResponse.ok) {
        throw new Error("Failed to parse resume")
      }

      const parsedData = await parseResponse.json()

      // 4. Calculate match score with mock API - ensure this completes
      let matchResult = { matchScore: 0, matchedSkills: [], missingSkills: [] }

      if (parsedData.skills && parsedData.skills.length > 0 && jobRequirements) {
        const matchResponse = await fetch("/api/ai/mock-match-calculator", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            candidateSkills: parsedData.skills,
            jobRequirements,
          }),
        })

        if (!matchResponse.ok) {
          throw new Error("Failed to calculate match score")
        }

        matchResult = await matchResponse.json()
      }

      // 5. Save candidate to database - ensure this completes
      const candidateName = parsedData.name || fileObj.name.split(".")[0].replace(/-/g, " ")

      // Split the name into first and last name
      let firstName = candidateName
      let lastName = "" // Default empty last_name

      // If the name contains a space, split it into first and last name
      if (candidateName.includes(" ")) {
        const nameParts = candidateName.split(" ")
        firstName = nameParts[0]
        // Join the rest as last name (in case of multiple last names)
        lastName = nameParts.slice(1).join(" ")
      }

      const email = parsedData.email || `${candidateName.toLowerCase().replace(/\s+/g, ".")}.${Date.now()}@example.com`

      // Check if candidate already exists
      const { data: existingCandidate, error: searchError } = await supabase
        .from("candidates")
        .select("id")
        .eq("email", email)
        .single()

      if (searchError && searchError.code !== "PGRST116") { // PGRST116 is "not found" error
        throw new Error(`Database search error: ${searchError.message}`)
      }

      let candidateData
      let candidateError

      if (existingCandidate) {
        // Update existing candidate
        const { data, error } = await supabase
          .from("candidates")
          .update({
            first_name: firstName,
            last_name: lastName,
            phone: parsedData.phone || null,
            job_id: selectedJob,
            match_score: matchResult.matchScore,
            skills: parsedData.skills || [],
            resume_url: filePath,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingCandidate.id)
          .select()

        candidateData = data
        candidateError = error
      } else {
        // Insert new candidate
        const { data, error } = await supabase
          .from("candidates")
          .insert({
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: parsedData.phone || null,
            job_id: selectedJob,
            match_score: matchResult.matchScore,
            status: "New",
            skills: parsedData.skills || [],
            resume_url: filePath,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: user!.id,
          })
          .select()

        candidateData = data
        candidateError = error
      }

      if (candidateError) {
        throw new Error(`Database error: ${candidateError.message}`)
      }

      // 6. Update UI with success
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileObj.id
            ? {
                ...f,
                status: "success",
                parsedData: {
                  name: parsedData.name,
                  email: parsedData.email,
                  phone: parsedData.phone,
                  skills: parsedData.skills,
                  matchScore: matchResult.matchScore,
                },
              }
            : f,
        ),
      )
    } catch (error) {
      console.error("Resume processing error:", error)

      // Update UI with error
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileObj.id
            ? {
                ...f,
                status: "error",
                error: error instanceof Error ? error.message : "Unknown error occurred",
              }
            : f,
        ),
      )
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files)
      }
    },
    [selectedJob, user],
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
    }
  }

  const handleRetry = (fileId: string) => {
    const fileToRetry = files.find((f) => f.id === fileId) as (ResumeFile & { file: File }) | undefined

    if (fileToRetry && "file" in fileToRetry) {
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: "uploading", progress: 0, error: undefined } : f)),
      )

      processFile(fileToRetry)
    } else {
      toast({
        title: "Retry failed",
        description: "Could not find the original file to retry.",
        variant: "destructive",
      })
    }
  }

  const handleComplete = () => {
    router.push("/candidates")
  }

  const handleCancel = () => {
    setFiles([])
    setUploadStarted(false)
  }

  return (
    <div className="container px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Resume Upload</h1>
        <p className="text-muted-foreground">Upload candidate resumes for AI parsing and matching.</p>
      </div>

      {!uploadStarted ? (
        <Card>
          <CardHeader>
            <CardTitle>Upload Resumes</CardTitle>
            <CardDescription>
              Upload up to 50 resumes at once. Supported formats: PDF, DOCX, DOC, TXT. Max size: 5MB per file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="job">
                Select Job Position <span className="text-red-500">*</span>
              </Label>
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

              {jobs.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No open jobs found.{" "}
                  <Link href="/jobs/create" className="text-[#A23FC6] hover:underline">
                    Create a job
                  </Link>{" "}
                  first.
                </p>
              )}
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center ${
                isDragging ? "border-[#A23FC6] bg-[#A23FC6]/5" : "border-gray-300"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-[#A23FC6]/10 p-4">
                  <UploadCloud className="h-10 w-10 text-[#A23FC6]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Drag and drop your resumes here</h3>
                  <p className="text-sm text-muted-foreground">or click to browse files</p>
                </div>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  ref={fileInputRef}
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={!selectedJob}>
                  <FileText className="mr-2 h-4 w-4" />
                  Select Files
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Our AI will automatically parse resumes and match candidates to the selected job.
            </p>
          </CardFooter>
        </Card>
      ) : (
        <UploadFeedback
          files={files}
          jobId={selectedJob}
          onComplete={handleComplete}
          onRetry={handleRetry}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}

