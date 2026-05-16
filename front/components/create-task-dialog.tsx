"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useTaskContext } from "@/lib/task-context"
import type { Priority, Status } from "@/lib/data"

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTaskDialog({ open, onOpenChange }: CreateTaskDialogProps) {
  const { addTask, projects, teamMembers } = useTaskContext()
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<Status>("new")
  const [priority, setPriority] = useState<Priority>("medium")
  const [projectId, setProjectId] = useState(projects[0]?.id || "")
  const [assigneeId, setAssigneeId] = useState(teamMembers[0]?.id || "")
  const [deadline, setDeadline] = useState("")

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setStatus("new")
    setPriority("medium")
    setProjectId(projects[0]?.id || "")
    setAssigneeId(teamMembers[0]?.id || "")
    setDeadline("")
  }

  const handleSubmit = async () => {
    if (!title.trim()) return
    setLoading(true)
    try {
      await addTask({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        projectId,
        assigneeId,
        deadline: deadline || undefined,
      })
      resetForm()
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-5 text-primary" />
            Create New Task
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Title */}
          <FormField label="Title" required>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              autoFocus
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </FormField>

          {/* Description */}
          <FormField label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </FormField>

          {/* Row: Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
                <option value="deferred">Deferred</option>
              </select>
            </FormField>

            <FormField label="Priority">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </FormField>
          </div>

          {/* Row: Project + Assignee */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Project">
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Assignee">
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {teamMembers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </FormField>
          </div>

          {/* Deadline */}
          <FormField label="Deadline">
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </FormField>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || loading}>
            {loading ? "Creating..." : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
        {hint && <span className="text-muted-foreground/60 ml-1 font-normal">({hint})</span>}
      </label>
      {children}
    </div>
  )
}
