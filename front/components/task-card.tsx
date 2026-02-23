"use client"

import { Calendar, MessageSquare, Paperclip, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { type Task, getUserById, getProjectById, priorityLabels } from "@/lib/data"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  task: Task
  onClick?: () => void
  variant?: "kanban" | "compact"
}

const priorityColors: Record<string, string> = {
  urgent: "bg-destructive/15 text-destructive border-destructive/20",
  high: "bg-warning/15 text-warning-foreground border-warning/20",
  medium: "bg-info/15 text-info border-info/20",
  low: "bg-muted text-muted-foreground border-border",
}

const priorityDots: Record<string, string> = {
  urgent: "bg-destructive",
  high: "bg-warning",
  medium: "bg-info",
  low: "bg-muted-foreground",
}

export function TaskCard({ task, onClick, variant = "kanban" }: TaskCardProps) {
  const assignee = getUserById(task.assigneeId)
  const project = getProjectById(task.projectId)
  const subtasksDone = task.subtasks.filter((s) => s.done).length
  const subtasksTotal = task.subtasks.length
  const progress = subtasksTotal > 0 ? (subtasksDone / subtasksTotal) * 100 : 0

  const isOverdue = new Date(task.deadline) < new Date() && task.status !== "done"

  if (variant === "compact") {
    return (
      <button
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-primary/30 hover:bg-accent/50"
      >
        <span className={cn("size-2 shrink-0 rounded-full", priorityDots[task.priority])} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
          <div className="flex items-center gap-2 mt-1">
            {project && (
              <span className="text-xs text-muted-foreground">{project.name}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {subtasksTotal > 0 && (
            <span className="text-xs text-muted-foreground">{subtasksDone}/{subtasksTotal}</span>
          )}
          <span className={cn("text-xs", isOverdue ? "text-destructive" : "text-muted-foreground")}>
            {formatDeadline(task.deadline)}
          </span>
          {assignee && (
            <Avatar className="size-6">
              <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-medium">
                {assignee.avatar}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="group flex w-full flex-col gap-3 rounded-lg border border-border bg-card p-3.5 text-left transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant="outline"
            className={cn("text-[10px] px-1.5 py-0 h-5 font-medium", priorityColors[task.priority])}
          >
            {priorityLabels[task.priority]}
          </Badge>
          {task.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-5 bg-secondary/70 text-muted-foreground"
            >
              {tag}
            </Badge>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          {task.id.toUpperCase()}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors">
        {task.title}
      </p>

      {/* Progress */}
      {subtasksTotal > 0 && (
        <div className="flex items-center gap-2">
          <Progress value={progress} className="h-1.5 flex-1" />
          <span className="text-[10px] text-muted-foreground font-medium">
            {subtasksDone}/{subtasksTotal}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <span className={cn(
            "flex items-center gap-1 text-[11px]",
            isOverdue ? "text-destructive" : "text-muted-foreground"
          )}>
            <Calendar className="size-3" />
            {formatDeadline(task.deadline)}
          </span>
          {task.comments.length > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MessageSquare className="size-3" />
              {task.comments.length}
            </span>
          )}
          {task.timeEstimate > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="size-3" />
              {task.timeSpent}h/{task.timeEstimate}h
            </span>
          )}
        </div>
        {assignee && (
          <Avatar className="size-6">
            <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-medium">
              {assignee.avatar}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </button>
  )
}

function formatDeadline(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return "Today"
  if (days === 1) return "Tomorrow"
  if (days <= 7) return `${days}d left`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
