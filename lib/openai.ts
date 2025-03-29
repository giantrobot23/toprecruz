import OpenAI from "openai"

// Update the OpenAI initialization to include the dangerouslyAllowBrowser flag
// This is only for development purposes - in production, you should use server-side API calls

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Only use this for development
})

export interface JobGenerationParams {
  jobTitle: string
  context?: string
}

export interface GeneratedJobContent {
  description: string
  responsibilities: string
  requirements: string
  benefits: string
}

export interface ResumeParsingResult {
  name?: string
  email?: string
  phone?: string
  skills?: string[]
  experience?: string[]
  education?: string[]
  summary?: string
}

export interface JobMatchResult {
  matchScore: number
  matchedSkills: string[]
  missingSkills: string[]
}

/**
 * Generate job description content using OpenAI
 */
export async function generateJobDescription(params: JobGenerationParams): Promise<GeneratedJobContent> {
  try {
    const { jobTitle, context = "" } = params

    const prompt = `
      Create a professional job description for a "${jobTitle}" position.
      ${context ? `Additional context: ${context}` : ""}
      
      Format the response as a JSON object with the following fields:
      - description: A detailed overview of the role (2-3 paragraphs)
      - responsibilities: A bullet-point list of key responsibilities (5-7 items)
      - requirements: A bullet-point list of required skills and qualifications (5-7 items)
      - benefits: A bullet-point list of benefits and perks (4-5 items)
      
      Each bullet point should start with a • character.
    `

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert HR professional who creates compelling job descriptions." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content || ""

    try {
      const parsedContent = JSON.parse(content) as GeneratedJobContent
      return parsedContent
    } catch (error) {
      console.error("Failed to parse OpenAI response as JSON:", error)
      // Fallback with empty structure
      return {
        description: "Failed to generate description.",
        responsibilities: "Failed to generate responsibilities.",
        requirements: "Failed to generate requirements.",
        benefits: "Failed to generate benefits.",
      }
    }
  } catch (error) {
    console.error("Error generating job description:", error)
    throw new Error("Failed to generate job description")
  }
}

/**
 * Parse resume text to extract structured information
 */
export async function parseResume(resumeText: string): Promise<ResumeParsingResult> {
  try {
    const prompt = `
      Extract the following information from this resume:
      - Full name
      - Email address
      - Phone number
      - Skills (as an array)
      - Work experience (as an array of positions)
      - Education (as an array)
      - Professional summary
      
      Format the response as a JSON object.
      
      Resume text:
      ${resumeText}
    `

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert resume parser that extracts structured information from resumes.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content || ""

    try {
      return JSON.parse(content) as ResumeParsingResult
    } catch (error) {
      console.error("Failed to parse OpenAI response as JSON:", error)
      return {}
    }
  } catch (error) {
    console.error("Error parsing resume:", error)
    throw new Error("Failed to parse resume")
  }
}

/**
 * Calculate match score between a candidate and job
 */
export async function calculateJobMatch(candidateSkills: string[], jobRequirements: string): Promise<JobMatchResult> {
  try {
    const prompt = `
      Calculate the match score between a candidate and job requirements.
      
      Candidate skills: ${JSON.stringify(candidateSkills)}
      
      Job requirements: ${jobRequirements}
      
      Return a JSON object with:
      - matchScore: A number between 0-100 representing the match percentage
      - matchedSkills: An array of skills that match the job requirements
      - missingSkills: An array of important skills from the job requirements that the candidate is missing
    `

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert recruiter who evaluates candidate-job matches." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content || ""

    try {
      return JSON.parse(content) as JobMatchResult
    } catch (error) {
      console.error("Failed to parse OpenAI response as JSON:", error)
      return {
        matchScore: 0,
        matchedSkills: [],
        missingSkills: [],
      }
    }
  } catch (error) {
    console.error("Error calculating job match:", error)
    throw new Error("Failed to calculate job match")
  }
}

