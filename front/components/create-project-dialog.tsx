"use client"

import { useState } from "react"
import { FolderPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useTaskContext } from "@/lib/task-context"
import { cn } from "@/lib/utils"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const presetColors = [
  "#4f8ff7", "#3b82f6", "#6366f1", "#8b5cf6",
  "#ec4899", "#ef4444", "#f59e0b", "#f97316",
  "#10b981", "#14b8a6", "#06b6d4", "#64748b",
]

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const { addProject } = useTaskContext()
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState(presetColors[0])

  const resetForm = () => {
    setName("")
    setDescription("")
    setColor(presetColors[0])
  }

  const handleSubmit = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      await addProject({
        name: name.trim(),
        color,
        description: description.trim() || undefined,
      })
      resetForm()
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="size-5 text-primary" />
            Create New Project
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Project name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name..."
              autoFocus
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Description <span className="text-muted-foreground/60 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief project description..."
              rows={3}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Color */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground">Project color</label>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "size-8 rounded-lg transition-all",
                    color === c ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" : "hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                >
                  <span className="sr-only">Select color {c}</span>
                </button>
              ))}
            </div>

            {/* Preview */}
            <div className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/30 p-3 mt-1">
              <div
                className="flex size-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${color}20` }}
              >
                <FolderPlus className="size-4" style={{ color }} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{name || "Project Name"}</p>
                <p className="text-xs text-muted-foreground">{description || "Project description"}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || loading}>
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
