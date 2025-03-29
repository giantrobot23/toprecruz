import { NextResponse } from "next/server"
import OpenAI from "openai"

// Initialize the OpenAI client (server-side only)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ResumeParsingResult {
  name?: string
  email?: string
  phone?: string
  skills?: string[]
  experience?: string[]
  education?: string[]
  summary?: string
}

export async function POST(request: Request) {
  try {
    const { resumeText } = await request.json()

    if (!resumeText) {
      return NextResponse.json({ error: "Resume text is required" }, { status: 400 })
    }

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
      const parsedContent = JSON.parse(content) as ResumeParsingResult
      return NextResponse.json(parsedContent)
    } catch (error) {
      console.error("Failed to parse OpenAI response as JSON:", error)
      return NextResponse.json({})
    }
  } catch (error) {
    console.error("Error parsing resume:", error)
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 })
  }
}

