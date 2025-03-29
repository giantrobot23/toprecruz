import { NextResponse } from "next/server"
import OpenAI from "openai"

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface GeneratedJobContent {
  description: string
  responsibilities: string
  requirements: string
  benefits: string
}

export async function POST(request: Request) {
  try {
    const { jobTitle, context = "" } = await request.json()

    if (!jobTitle) {
      return NextResponse.json({ error: "Job title is required" }, { status: 400 })
    }

    const prompt = `
      Create a professional LinkedIn-style job posting for a "${jobTitle}" position.
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
        {
          role: "system",
          content: "You are an expert HR professional who creates compelling LinkedIn-style job descriptions.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content || ""

    try {
      const parsedContent = JSON.parse(content) as GeneratedJobContent
      return NextResponse.json(parsedContent)
    } catch (error) {
      console.error("Failed to parse OpenAI response as JSON:", error)
      // Fallback with empty structure
      return NextResponse.json({
        description: "Failed to generate description.",
        responsibilities: "Failed to generate responsibilities.",
        requirements: "Failed to generate requirements.",
        benefits: "Failed to generate benefits.",
      })
    }
  } catch (error) {
    console.error("Error generating job description:", error)
    return NextResponse.json({ error: "Failed to generate job description" }, { status: 500 })
  }
}

