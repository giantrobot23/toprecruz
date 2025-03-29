import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { candidateSkills, jobRequirements } = await request.json()

    // More deterministic mock implementation
    const matchScore = 85 // Fixed score for reliability

    // Use the actual candidate skills for matched skills
    const matchedSkills = candidateSkills.slice(0, Math.ceil(candidateSkills.length * 0.7))

    // Fixed missing skills
    const missingSkills = ["GraphQL", "AWS", "Docker"]

    return NextResponse.json({
      matchScore,
      matchedSkills,
      missingSkills,
    })
  } catch (error) {
    console.error("Error in mock match calculator:", error)
    return NextResponse.json({ error: "Failed to calculate match" }, { status: 500 })
  }
}

