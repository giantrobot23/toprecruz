"use client"

import dynamic from "next/dynamic"

// Dynamically import the real client component with no SSR
// Change to use the mock version for reliable processing without OpenAI API
const ResumeUploadClient = dynamic(() => import("./page-client-mock"), { ssr: false })

export default function ClientWrapper() {
  return <ResumeUploadClient />
}

