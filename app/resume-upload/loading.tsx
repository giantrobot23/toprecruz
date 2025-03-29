import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container px-4 md:px-6 py-8">
      <div className="mb-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-5 w-full max-w-md mb-2" />

          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="border-2 border-dashed rounded-lg p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>

        <div className="p-6 border-t">
          <Skeleton className="h-5 w-96" />
        </div>
      </div>
    </div>
  )
}

