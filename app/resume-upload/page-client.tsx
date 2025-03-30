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
import { checkResourceLimit, incrementUsageCounter } from "@/lib/plan-limits"
import { parseResume } from "@/lib/ai"

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

  const processFiles = async (fileList: FileList) => {
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

    // Check resume upload limit
    const limitCheck = await checkResourceLimit(user.id, "resume_uploads")

    if (!limitCheck.allowed) {
      setError(limitCheck.message || "You've reached your monthly resume upload limit")
      toast({
        title: "Upload limit reached",
        description: limitCheck.message,
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

    // Check if adding these files would exceed the limit
    if (valid.length > limitCheck.limit - limitCheck.current) {
      setError(`You can only upload ${limitCheck.limit - limitCheck.current} more resume(s) this month`)
      toast({
        title: "Upload limit exceeded",
        description: `You can only upload ${limitCheck.limit - limitCheck.current} more resume(s) this month`,
        variant: "destructive",
      })
      return
    }

    // Create file objects for tracking
    const newFiles = valid.map((file) => ({
      id: Math.random().toString(36).substring(2, 11),
      name: file.name,
      size: file.size,
      status: "uploading" as const,
      progress: 0,
      file: file,
    }))

    setFiles((prev) => [...prev, ...newFiles])
    setUploadStarted(true)

    // Process each file
    for (const fileObj of newFiles) {
      await processFile(fileObj)
    }
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
      // 1. Upload file to storage
      const { path: filePath, error: uploadError } = await uploadResume(fileObj.file, user.id, fileObj.name.split(".")[0])

      if (uploadError) {
        throw new Error(`Upload error: ${uploadError.message}`)
      }

      // 2. Get job description
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("description")
        .eq("id", selectedJob)
        .single()

      if (jobError) {
        throw new Error(`Job fetch error: ${jobError.message}`)
      }

      // 3. Read file content
      const fileContent = await fileObj.file.text()

      // 4. Parse resume and get match analysis
      const { parsedData, matchResult } = await parseResume(fileContent, jobData.description)

      // 5. Save candidate to database
      const { error: candidateError } = await supabase.from("candidates").insert({
        name: parsedData.name,
        email: parsedData.email,
        phone: parsedData.phone,
        job_id: selectedJob,
        match_score: matchResult.matchScore,
        status: "New",
        skills: parsedData.skills,
        experience: parsedData.experience,
        education: parsedData.education,
        matched_skills: matchResult.matchedSkills,
        missing_skills: matchResult.missingSkills,
        analysis: matchResult.analysis,
        resume_url: filePath,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id,
      })

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

