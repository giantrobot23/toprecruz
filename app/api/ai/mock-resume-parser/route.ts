import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { resumeText } = await request.json()

    // Extract name from the resume text (simple mock implementation)
    const nameMatch = resumeText.match(/Resume for ([\w\s]+)/) || []
    let name = nameMatch[1] || ""

    // If name is still empty, extract from filename or use a default
    if (!name || name.trim() === "") {
      // Try to extract from the resumeText in case it contains a filename
      const filenameMatch = resumeText.match(/([^/\\]+)(?=\.\w+$)/) || []
      name = filenameMatch[1] || "Unknown Candidate"

      // Replace hyphens with spaces for better readability
      name = name.replace(/-/g, " ")
    }

    // Ensure name is properly formatted (capitalize first letter of each word)
    name = name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")

    // Split name into first and last name
    let firstName = name
    let lastName = ""

    if (name.includes(" ")) {
      const nameParts = name.split(" ")
      firstName = nameParts[0]
      lastName = nameParts.slice(1).join(" ")
    }

    // Generate a more realistic email
    const email = `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`

    // Mock response with more complete data
    return NextResponse.json({
      name: name,
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: "555-123-4567",
      skills: ["JavaScript", "React", "TypeScript", "Node.js", "HTML", "CSS"],
      experience: ["5 years of frontend development at TechCorp", "2 years as junior developer at StartupXYZ"],
      education: ["Bachelor's in Computer Science from Tech University"],
      summary: "Experienced frontend developer with a passion for creating user-friendly interfaces.",
      matched_skills: ["JavaScript", "React", "TypeScript"],
      missing_skills: ["GraphQL", "AWS"],
    })
  } catch (error) {
    console.error("Error in mock resume parser:", error)
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 })
  }
}

