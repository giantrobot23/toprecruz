"use client"

import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, CheckCircle, Clock, FileText, X, ChevronDown, ChevronUp, RefreshCw } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

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

interface UploadFeedbackProps {
  files: ResumeFile[]
  jobId: string
  onComplete: () => void
  onRetry: (fileId: string) => void
  onCancel: () => void
}

export function UploadFeedback({ files, jobId, onComplete, onRetry, onCancel }: UploadFeedbackProps) {
  const [activeTab, setActiveTab] = useState<string>("all")
  const [expandedFiles, setExpandedFiles] = useState<string[]>([])

  const toggleFileExpand = (fileId: string) => {
    if (expandedFiles.includes(fileId)) {
      setExpandedFiles(expandedFiles.filter((id) => id !== fileId))
    } else {
      setExpandedFiles([...expandedFiles, fileId])
    }
  }

  const totalFiles = files.length
  const uploadedFiles = files.filter((f) => f.progress === 100).length
  const successFiles = files.filter((f) => f.status === "success").length
  const errorFiles = files.filter((f) => f.status === "error").length
  const inProgressFiles = files.filter((f) => ["uploading", "parsing"].includes(f.status)).length

  const overallProgress = Math.round((uploadedFiles / totalFiles) * 100)
  const isComplete = inProgressFiles === 0

  const filteredFiles = files.filter((file) => {
    if (activeTab === "all") return true
    if (activeTab === "success") return file.status === "success"
    if (activeTab === "error") return file.status === "error"
    if (activeTab === "inprogress") return ["uploading", "parsing"].includes(file.status)
    return true
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="text-green-500" size={16} />
      case "error":
        return <AlertCircle className="text-red-500" size={16} />
      case "uploading":
        return <Clock className="text-blue-500" size={16} />
      case "parsing":
        return <Clock className="text-purple-500" size={16} />
      default:
        return <FileText size={16} />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "success":
        return "Processed successfully"
      case "error":
        return "Failed to process"
      case "uploading":
        return "Uploading file..."
      case "parsing":
        return "AI analyzing resume..."
      default:
        return "Unknown status"
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Resume Upload Progress</span>
          {!isComplete && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X size={16} className="mr-2" />
              Cancel
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Uploading and parsing {totalFiles} resumes for job ID: {jobId}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress: {overallProgress}%</span>
            <span>
              {uploadedFiles}/{totalFiles} files processed
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Success: {successFiles}
          </Badge>
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Errors: {errorFiles}
          </Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            In Progress: {inProgressFiles}
          </Badge>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All ({totalFiles})</TabsTrigger>
            <TabsTrigger value="success">Success ({successFiles})</TabsTrigger>
            <TabsTrigger value="error">Errors ({errorFiles})</TabsTrigger>
            <TabsTrigger value="inprogress">In Progress ({inProgressFiles})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <ScrollArea className="h-[300px] rounded-md border p-2">
              <div className="space-y-2">
                {filteredFiles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No files to display</div>
                ) : (
                  filteredFiles.map((file) => (
                    <Collapsible key={file.id} open={expandedFiles.includes(file.id)} className="border rounded-md">
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getStatusIcon(file.status)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} • {getStatusText(file.status)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {file.status === "error" && (
                            <Button variant="ghost" size="sm" onClick={() => onRetry(file.id)} className="h-8 px-2">
                              <RefreshCw size={14} className="mr-1" />
                              Retry
                            </Button>
                          )}

                          {file.status === "success" && file.parsedData?.matchScore && (
                            <Badge
                              variant="outline"
                              className={
                                file.parsedData.matchScore >= 90
                                  ? "bg-green-100 text-green-800"
                                  : file.parsedData.matchScore >= 70
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-gray-100 text-gray-800"
                              }
                            >
                              {file.parsedData.matchScore}% Match
                            </Badge>
                          )}

                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFileExpand(file.id)}
                              className="h-8 w-8 p-0"
                              disabled={["uploading", "parsing"].includes(file.status)}
                            >
                              {expandedFiles.includes(file.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>

                      {file.status !== "uploading" && (
                        <CollapsibleContent>
                          <div className="px-3 pb-3 pt-0">
                            {file.status === "error" ? (
                              <div className="bg-red-50 p-3 rounded-md text-sm text-red-800">
                                <p className="font-medium">Error:</p>
                                <p>{file.error || "Unknown error occurred during processing"}</p>
                              </div>
                            ) : file.status === "success" && file.parsedData ? (
                              <div className="bg-gray-50 p-3 rounded-md">
                                <h4 className="text-sm font-medium mb-2">Parsed Data:</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Name:</p>
                                    <p>{file.parsedData.name || "N/A"}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Email:</p>
                                    <p>{file.parsedData.email || "N/A"}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Phone:</p>
                                    <p>{file.parsedData.phone || "N/A"}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Match Score:</p>
                                    <p>{file.parsedData.matchScore || 0}%</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-muted-foreground">Skills:</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {file.parsedData.skills?.map((skill, i) => (
                                        <Badge key={i} variant="outline" className="bg-purple-50">
                                          {skill}
                                        </Badge>
                                      )) || "N/A"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-500">
                                Processing in progress...
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      )}

                      {["uploading", "parsing"].includes(file.status) && (
                        <div className="px-3 pb-3">
                          <Progress
                            value={file.status === "parsing" ? 100 : file.progress}
                            className={`h-1 ${file.status === "parsing" ? "animate-pulse bg-purple-500" : ""}`}
                          />
                          <p className="text-xs text-center mt-1 text-muted-foreground">
                            {file.status === "parsing"
                              ? "AI analyzing resume content..."
                              : `Uploading: ${file.progress}%`}
                          </p>
                        </div>
                      )}
                    </Collapsible>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {isComplete
            ? `Completed processing ${successFiles} of ${totalFiles} resumes`
            : `Processing ${inProgressFiles} files...`}
        </div>
        <Button onClick={onComplete} className="bg-[#A23FC6] hover:bg-[#B56FD1] text-white">
          View Candidates
        </Button>
      </CardFooter>
    </Card>
  )
}

