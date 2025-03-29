"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Download } from "lucide-react"
import ExportFunctionality from "@/components/export-functionality"

export function ExportModal({ candidateCount }: { candidateCount: number }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download size={16} />
          Export Candidates
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Candidates</DialogTitle>
          <DialogDescription>Export your candidate data in CSV or PDF format.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>
            You are about to export <b>{candidateCount}</b> candidates.
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <ExportFunctionality onExportComplete={() => setOpen(false)} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

