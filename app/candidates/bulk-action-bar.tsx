"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CheckSquare, ChevronDown, Trash, X } from "lucide-react"

interface BulkActionBarProps {
  selectedCount: number
  onStatusUpdate: (status: string) => void
  onDelete: () => void
}

export function BulkActionBar({ selectedCount, onStatusUpdate, onDelete }: BulkActionBarProps) {
  return (
    <div className="bg-muted p-3 rounded-md mb-4 flex items-center justify-between">
      <div className="text-sm flex items-center gap-2">
        <span className="font-medium">{selectedCount}</span> candidates selected
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => window.location.reload()}>
          <X className="h-4 w-4" />
          <span className="sr-only">Clear selection</span>
        </Button>
      </div>
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-1">
              <CheckSquare className="h-4 w-4" />
              Update Status
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onStatusUpdate("New")}>Mark as New</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusUpdate("Reviewed")}>Mark as Reviewed</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusUpdate("Shortlisted")}>Mark as Shortlisted</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusUpdate("Interviewed")}>Mark as Interviewed</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusUpdate("Rejected")}>Mark as Rejected</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" className="gap-1 text-red-600 hover:bg-red-50" onClick={onDelete}>
          <Trash className="h-4 w-4" />
          Delete Selected
        </Button>
      </div>
    </div>
  )
}

