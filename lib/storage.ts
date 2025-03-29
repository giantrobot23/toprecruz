import { supabase } from "@/lib/supabase"

/**
 * Uploads a resume file to Supabase Storage with user ID in the path
 * @param file The file to upload
 * @param userId The authenticated user's ID
 * @param candidateName Optional candidate name for the filename
 * @returns Object containing the file path if successful
 */
export async function uploadResume(
  file: File,
  userId: string,
  candidateName?: string,
): Promise<{ path: string; url: string | null; error: Error | null }> {
  try {
    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ]
    if (!allowedTypes.includes(file.type)) {
      return {
        path: "",
        url: null,
        error: new Error("Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed."),
      }
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return {
        path: "",
        url: null,
        error: new Error("File too large. Maximum size is 5MB."),
      }
    }

    // Create a unique filename with user ID path
    const fileExtension = file.name.split(".").pop()
    const sanitizedName = candidateName ? candidateName.toLowerCase().replace(/[^a-z0-9]/g, "-") : "resume"
    const uniqueId = Date.now().toString()
    const filePath = `${userId}/${sanitizedName}-${uniqueId}.${fileExtension}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage.from("resumes").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Error uploading file:", error)
      return {
        path: "",
        url: null,
        error: new Error(`Upload failed: ${error.message}`),
      }
    }

    // Get the URL for the uploaded file
    const { data: urlData } = await supabase.storage.from("resumes").createSignedUrl(filePath, 3600) // 1 hour signed URL

    return {
      path: filePath,
      url: urlData?.signedUrl || null,
      error: null,
    }
  } catch (error) {
    console.error("Unexpected error during upload:", error)
    return {
      path: "",
      url: null,
      error: error instanceof Error ? error : new Error("Unknown upload error"),
    }
  }
}

/**
 * Generates a signed URL for securely accessing a resume file
 * @param filePath The path of the file in storage
 * @param expiresIn Expiration time in seconds (default: 60 minutes)
 * @returns The signed URL or null if generation fails
 */
export async function getSignedResumeUrl(
  filePath: string,
  expiresIn = 3600,
): Promise<{ signedUrl: string | null; error: Error | null }> {
  try {
    // Validate the file path
    if (!filePath || !filePath.includes("/")) {
      return {
        signedUrl: null,
        error: new Error("Invalid file path"),
      }
    }

    // Generate a signed URL
    const { data, error } = await supabase.storage.from("resumes").createSignedUrl(filePath, expiresIn)

    if (error) {
      console.error("Error generating signed URL:", error)
      return {
        signedUrl: null,
        error: new Error(`Failed to generate signed URL: ${error.message}`),
      }
    }

    return {
      signedUrl: data.signedUrl,
      error: null,
    }
  } catch (error) {
    console.error("Unexpected error generating signed URL:", error)
    return {
      signedUrl: null,
      error: error instanceof Error ? error : new Error("Unknown error generating signed URL"),
    }
  }
}

