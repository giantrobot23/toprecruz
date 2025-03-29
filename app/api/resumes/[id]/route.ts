import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the resume from the database
    const { data: candidate, error: candidateError } = await supabase
      .from("candidates")
      .select("resume_url")
      .eq("id", params.id)
      .single()

    if (candidateError || !candidate?.resume_url) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    // Generate a signed URL with short expiration
    const { data, error } = await supabase.storage.from("resumes").createSignedUrl(candidate.resume_url, 300) // 5 minutes

    if (error) {
      return NextResponse.json({ error: "Failed to generate URL" }, { status: 500 })
    }

    return NextResponse.json({ url: data.signedUrl })
  } catch (error) {
    console.error("Error accessing resume:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

