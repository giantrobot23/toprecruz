import { NextResponse } from "next/server"
import OpenAI from "openai"

// Initialize the OpenAI client (server-side only)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface JobMatchResult {
  matchScore: number
  matchedSkills: string[]
  missingSkills: string[]
}

export async function POST(request: Request) {
  try {
    const { candidateSkills, jobRequirements } = await request.json()

    if (!candidateSkills || !jobRequirements) {
      return NextResponse.json({ error: "Candidate skills and job requirements are required" }, { status: 400 })
    }

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
      const parsedContent = JSON.parse(content) as JobMatchResult
      return NextResponse.json(parsedContent)
    } catch (error) {
      console.error("Failed to parse OpenAI response as JSON:", error)
      return NextResponse.json({
        matchScore: 0,
        matchedSkills: [],
        missingSkills: [],
      })
    }
  } catch (error) {
    console.error("Error calculating job match:", error)
    return NextResponse.json({ error: "Failed to calculate job match" }, { status: 500 })
  }
}

