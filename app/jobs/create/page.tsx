"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, BrainCircuit, FileEdit, Wand2, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function CreateJobPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [creationMethod, setCreationMethod] = useState<"choose" | "manual" | "ai">("choose")
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    employmentType: "Full-time",
    experienceLevel: "Mid-Level",
    salaryRange: "",
    description: "",
    responsibilities: "",
    requirements: "",
    benefits: "",
  })
  const [roleDescription, setRoleDescription] = useState("")
  const [regenerationCount, setRegenerationCount] = useState(0)
  const [MAX_REGENERATIONS] = useState(3)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenerateDescription = async () => {
    if (!formData.title) {
      toast({
        title: "Job title required",
        description: "Please enter a job title to generate a description.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle: formData.title,
          context: roleDescription,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate job description")
      }

      const { content } = await response.json()
      
      // Update form data with generated content
      setFormData((prev) => ({
        ...prev,
        description: content,
      }))

      toast({
        title: "Description generated",
        description: "AI-generated job description has been created.",
      })
    } catch (error) {
      console.error("Error generating job description:", error)
      toast({
        title: "Generation failed",
        description: "Failed to generate job description. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = () => {
    if (regenerationCount >= MAX_REGENERATIONS) {
      toast({
        title: "Regeneration limit reached",
        description: "You've reached the maximum number of regenerations.",
        variant: "destructive",
      })
      return
    }

    setRegenerationCount((prev) => prev + 1)
    handleGenerateDescription()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("jobs").insert({
        title: formData.title,
        department: formData.department || null,
        location: formData.location || null,
        employment_type: formData.employmentType,
        experience_level: formData.experienceLevel,
        salary_range: formData.salaryRange || null,
        description: formData.description,
        responsibilities: formData.responsibilities || null,
        requirements: formData.requirements,
        benefits: formData.benefits || null,
        status: "Open",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user!.id,
      })

      if (error) throw error

      toast({
        title: "Job created",
        description: "Your job posting has been created successfully.",
      })

      router.push("/jobs")
    } catch (error) {
      console.error("Error creating job:", error)
      toast({
        title: "Error",
        description: "Failed to create job posting. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Render the method selection screen
  if (creationMethod === "choose") {
    return (
      <div className="container px-4 md:px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <Link href="/jobs">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Create Job</h1>
          </div>
          <p className="text-muted-foreground mt-2">Choose how you want to create your job posting.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card
            className="cursor-pointer hover:border-[#A23FC6] transition-all"
            onClick={() => setCreationMethod("manual")}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-blue-100">
                  <FileEdit className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Manual Creation</CardTitle>
              </div>
              <CardDescription>Create a job posting from scratch by filling out all details manually.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Best for when you have specific requirements and want complete control over the job description.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline">
                Create Manually
              </Button>
            </CardFooter>
          </Card>

          <Card
            className="cursor-pointer hover:border-[#A23FC6] transition-all"
            onClick={() => setCreationMethod("ai")}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-purple-100">
                  <BrainCircuit className="h-6 w-6 text-[#A23FC6]" />
                </div>
                <CardTitle>AI-Assisted Creation</CardTitle>
              </div>
              <CardDescription>Let AI generate your job description based on basic information.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Best for quickly creating professional job descriptions with minimal effort. You can still edit the
                results.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-[#A23FC6] hover:bg-[#B56FD1] text-white">Use AI Assistant</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  // Render the AI-assisted creation form
  if (creationMethod === "ai") {
    return (
      <div className="container px-4 md:px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCreationMethod("choose")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">AI-Assisted Job Creation</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Let AI generate a professional job description based on minimal information.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
              <CardDescription>Provide basic information to generate a job posting.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Job Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Frontend Developer"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="roleDescription">Additional Context (Optional)</Label>
                <Textarea
                  id="roleDescription"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="Add any specific requirements, technologies, or context about the role..."
                  className="min-h-[100px]"
                />
              </div>

              <Button
                type="button"
                className="w-full bg-[#A23FC6] hover:bg-[#B56FD1] text-white flex items-center gap-2"
                onClick={handleGenerateDescription}
                disabled={isGenerating || !formData.title}
              >
                <Wand2 className="h-4 w-4" />
                {isGenerating ? "Generating..." : "Generate with AI"}
              </Button>
            </CardContent>
          </Card>

          {formData.description && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Generated Job Posting</CardTitle>
                  <CardDescription>Review and edit the AI-generated content before saving.</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={regenerationCount >= MAX_REGENERATIONS || isGenerating}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                  {regenerationCount > 0 && <span className="text-xs">({MAX_REGENERATIONS - regenerationCount} left)</span>}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="min-h-[400px] font-mono"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setCreationMethod("choose")}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#A23FC6] hover:bg-[#B56FD1] text-white" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Job"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </form>
      </div>
    )
  }

  // Render the manual creation form
  return (
    <div className="container px-4 md:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCreationMethod("choose")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Create Job Manually</h1>
        </div>
        <p className="text-muted-foreground mt-2">Create a new job listing for candidates to apply.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details of the job.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Job Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Frontend Developer"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g. Engineering"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Remote, New York, NY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryRange">Salary Range</Label>
                  <Input
                    id="salaryRange"
                    name="salaryRange"
                    value={formData.salaryRange}
                    onChange={handleChange}
                    placeholder="e.g. $80,000 - $100,000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <select
                    id="employmentType"
                    value={formData.employmentType}
                    onChange={(e) => handleSelectChange("employmentType", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experienceLevel">Experience Level</Label>
                  <select
                    id="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={(e) => handleSelectChange("experienceLevel", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Entry-Level">Entry-Level</option>
                    <option value="Mid-Level">Mid-Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                    <option value="Manager">Manager</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>Describe the job in detail.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide a detailed description of the job..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsibilities">Responsibilities</Label>
                <Textarea
                  id="responsibilities"
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleChange}
                  placeholder="List the key responsibilities..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requirements">
                  Requirements <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="List the required skills and qualifications..."
                  className="min-h-[100px]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="benefits">Benefits</Label>
                <Textarea
                  id="benefits"
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  placeholder="List the benefits and perks..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => setCreationMethod("choose")}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#A23FC6] hover:bg-[#B56FD1] text-white" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Job"}
          </Button>
        </div>
      </form>
    </div>
  )
}

