import OpenAI from "openai"
import { supabase } from "./supabase"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface ParsedResume {
  name: string
  email: string
  phone: string
  skills: string[]
  experience: {
    title: string
    company: string
    duration: string
    description: string
  }[]
  education: {
    degree: string
    institution: string
    year: string
  }[]
}

interface MatchResult {
  matchScore: number
  matchedSkills: string[]
  missingSkills: string[]
  analysis: string
}

export async function parseResume(fileContent: string, jobDescription: string): Promise<{
  parsedData: ParsedResume
  matchResult: MatchResult
}> {
  try {
    // First, extract information from the resume with a more focused prompt for GPT-3.5
    const extractionPrompt = `Extract the following information from this resume in JSON format. Be precise and accurate:
    {
      "name": "Full name",
      "email": "Email address",
      "phone": "Phone number",
      "skills": ["List of technical and professional skills"],
      "experience": [
        {
          "title": "Job title",
          "company": "Company name",
          "duration": "Duration",
          "description": "Key responsibilities and achievements"
        }
      ],
      "education": [
        {
          "degree": "Degree name",
          "institution": "Institution name",
          "year": "Year completed"
        }
      ]
    }
    
    Resume:
    ${fileContent}`

    const extractionResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: extractionPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent results
    })

    const parsedData = JSON.parse(extractionResponse.choices[0].message.content || "{}")

    // Then, analyze the match with the job description using a more structured prompt
    const analysisPrompt = `Analyze this candidate's resume against the job description and provide a detailed assessment in JSON format:
    {
      "matchScore": number (0-100, based on skills match, experience relevance, and overall fit),
      "matchedSkills": ["List of skills that match the job requirements"],
      "missingSkills": ["List of required skills that are missing"],
      "analysis": "A concise analysis of the candidate's fit, focusing on key strengths and potential gaps"
    }

    Job Description:
    ${jobDescription}

    Candidate Information:
    ${JSON.stringify(parsedData, null, 2)}

    Consider these factors for the match score:
    - Skills match (40% weight)
    - Experience relevance (40% weight)
    - Education fit (20% weight)`

    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: analysisPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent results
    })

    const matchResult = JSON.parse(analysisResponse.choices[0].message.content || "{}")

    return {
      parsedData,
      matchResult,
    }
  } catch (error) {
    console.error("Error parsing resume:", error)
    throw new Error("Failed to parse resume")
  }
} 