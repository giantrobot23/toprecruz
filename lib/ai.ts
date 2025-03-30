import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface JobDetails {
  title: string
  description: string
  requirements: string
  salary: string
  location: string
  type: string
  skills: string[]
}

export async function generateJobPosting(prompt: string): Promise<JobDetails> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert HR professional and job posting writer. Create detailed, professional job postings that attract qualified candidates. 
          Focus on clear requirements, competitive benefits, and growth opportunities. Use industry-standard terminology and maintain a professional tone.`
        },
        {
          role: "user",
          content: `Create a detailed job posting based on this description: ${prompt}
          
          Provide the response in this exact JSON format:
          {
            "title": "Job title",
            "description": "Detailed job description including responsibilities and benefits",
            "requirements": "List of specific requirements and qualifications",
            "salary": "Salary range and benefits",
            "location": "Job location and work arrangement",
            "type": "Full-time, Part-time, Contract, or Internship",
            "skills": ["List of required technical and soft skills"]
          }
          
          Guidelines:
          - Make the description engaging and clear
          - Include specific requirements
          - List relevant skills
          - Specify salary range if mentioned
          - Include location and work type
          - Focus on growth opportunities
          - Use professional language`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent results
    })

    const response = completion.choices[0].message.content
    if (!response) {
      throw new Error("No response from OpenAI")
    }

    return JSON.parse(response)
  } catch (error) {
    console.error("Error generating job posting:", error)
    throw new Error("Failed to generate job posting")
  }
}

export async function analyzeResume(resumeText: string, jobDescription: string): Promise<{
  matchScore: number
  analysis: string
  matchedSkills: string[]
  missingSkills: string[]
}> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert HR professional and resume analyzer. Analyze resumes against job descriptions to determine candidate fit.
          Focus on skills match, experience relevance, and overall potential. Provide detailed, objective analysis.`
        },
        {
          role: "user",
          content: `Analyze this resume against the job description and provide a detailed assessment:
          
          Resume:
          ${resumeText}
          
          Job Description:
          ${jobDescription}
          
          Provide the response in this exact JSON format:
          {
            "matchScore": number (0-100, based on skills match, experience relevance, and overall fit),
            "analysis": "Detailed analysis of candidate's fit, strengths, and potential gaps",
            "matchedSkills": ["List of skills that match the job requirements"],
            "missingSkills": ["List of required skills that are missing"]
          }
          
          Consider these factors for the match score:
          - Skills match (40% weight)
          - Experience relevance (40% weight)
          - Education fit (20% weight)`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent results
    })

    const response = completion.choices[0].message.content
    if (!response) {
      throw new Error("No response from OpenAI")
    }

    return JSON.parse(response)
  } catch (error) {
    console.error("Error analyzing resume:", error)
    throw new Error("Failed to analyze resume")
  }
} 