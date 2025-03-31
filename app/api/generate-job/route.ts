import { NextResponse } from "next/server"
import OpenAI from "openai"

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface GeneratedJobContent {
  content: string
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
      
      Write a complete, well-formatted job posting that includes:
      - A compelling overview of the role and company
      - Key responsibilities
      - Required qualifications and skills
      - Benefits and perks
      
      Format the response as a JSON object with a single "content" field containing the complete job posting.
      Use proper spacing and bullet points (•) for lists.
      Keep the tone professional but engaging.
    `

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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
        content: "Failed to generate job posting. Please try again.",
      })
    }
  } catch (error) {
    console.error("Error generating job description:", error)
    return NextResponse.json({ error: "Failed to generate job description" }, { status: 500 })
  }
}

