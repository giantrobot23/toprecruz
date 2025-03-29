"use client"

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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { generateDummyJob, generateDummyCandidate } from "@/lib/dummy-data"
import { supabase } from "@/lib/supabase"

interface DummyDataGeneratorProps {
  userId: string
}

export function DummyDataGenerator({ userId }: DummyDataGeneratorProps) {
  const [open, setOpen] = useState(false)
  const [numJobs, setNumJobs] = useState(5)
  const [numCandidatesPerJob, setNumCandidatesPerJob] = useState(10)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedJobs, setGeneratedJobs] = useState(0)
  const [generatedCandidates, setGeneratedCandidates] = useState(0)

  const handleGenerate = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is required to generate data.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setGeneratedJobs(0)
    setGeneratedCandidates(0)

    try {
      // Generate jobs
      const jobIds: string[] = []
      const jobRequirements: Record<string, string> = {}

      for (let i = 0; i < numJobs; i++) {
        const job = generateDummyJob(userId)

        // Insert job into database
        const { data, error } = await supabase.from("jobs").insert(job).select("id").single()

        if (error) throw error

        jobIds.push(data.id)
        jobRequirements[data.id] = job.requirements

        setGeneratedJobs(i + 1)
        setProgress(((i + 1) / (numJobs + numJobs * numCandidatesPerJob)) * 100)
      }

      // Generate candidates for each job
      let totalCandidatesGenerated = 0

      for (const jobId of jobIds) {
        for (let i = 0; i < numCandidatesPerJob; i++) {
          const candidate = generateDummyCandidate(userId, jobId, jobRequirements[jobId])

          // Insert candidate into database
          const { error } = await supabase.from("candidates").insert(candidate)

          if (error) throw error

          totalCandidatesGenerated++
          setGeneratedCandidates(totalCandidatesGenerated)
          setProgress(((generatedJobs + totalCandidatesGenerated) / (numJobs + numJobs * numCandidatesPerJob)) * 100)
        }
      }

      toast({
        title: "Data generation complete",
        description: `Successfully generated ${generatedJobs} jobs and ${totalCandidatesGenerated} candidates.`,
      })
    } catch (error) {
      console.error("Error generating dummy data:", error)
      toast({
        title: "Error",
        description: "Failed to generate dummy data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Generate Dummy Data</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Dummy Data</DialogTitle>
          <DialogDescription>Create dummy jobs and candidates to see how the system looks with data.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isGenerating ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="numJobs">Number of Jobs</Label>
                <Input
                  id="numJobs"
                  type="number"
                  min="1"
                  max="20"
                  value={numJobs}
                  onChange={(e) => setNumJobs(Number.parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numCandidatesPerJob">Candidates per Job</Label>
                <Input
                  id="numCandidatesPerJob"
                  type="number"
                  min="1"
                  max="50"
                  value={numCandidatesPerJob}
                  onChange={(e) => setNumCandidatesPerJob(Number.parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm text-muted-foreground">
                  This will generate {numJobs} jobs and {numJobs * numCandidatesPerJob} candidates with realistic data.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Generating data...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              <div className="space-y-1">
                <p className="text-sm">
                  Jobs: {generatedJobs} of {numJobs}
                </p>
                <p className="text-sm">
                  Candidates: {generatedCandidates} of {numJobs * numCandidatesPerJob}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!isGenerating ? (
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} className="bg-[#A23FC6] hover:bg-[#B56FD1] text-white">
                Generate Data
              </Button>
            </>
          ) : (
            <Button variant="outline" disabled>
              Generating...
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

