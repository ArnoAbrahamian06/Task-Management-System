"use client"

import { useState } from "react"
import {
  X,
  Calendar,
  Clock,
  User,
  Tag,
  MessageSquare,
  CheckSquare,
  Square,
  Send,
  FolderOpen,
  Flag,
  MoreHorizontal,
  ExternalLink,
  Pencil,
  Trash2,
  Copy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  type Task,
  statusLabels,
  priorityLabels,
  priorityColors,
  type Status,
} from "@/lib/data"
import { useTaskContext } from "@/lib/task-context"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface TaskDetailPanelProps {
  task: Task
  onClose: () => void
}

const statusColors: Record<Status, string> = {
  new: "bg-info/15 text-info border-info/30",
  in_progress: "bg-warning/15 text-warning border-warning/30",
  review: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  done: "bg-success/15 text-success border-success/30",
  deferred: "bg-muted text-muted-foreground border-border",
}

export function TaskDetailPanel({ task, onClose }: TaskDetailPanelProps) {
  const { getUserById, getProjectById } = useTaskContext()
  const [newComment, setNewComment] = useState("")
  const assignee = getUserById(task.assigneeId)
  const creator = getUserById(task.creatorId)
  const project = getProjectById(task.projectId)
  const projectName = project?.name ?? task.projectName
  const subtasksDone = task.subtasks.filter((s) => s.done).length
  const subtasksTotal = task.subtasks.length
  const progress = subtasksTotal > 0 ? (subtasksDone / subtasksTotal) * 100 : 0

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-border bg-card shadow-2xl shadow-background/80 md:relative md:shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">{task.id.toUpperCase()}</span>
          <Badge variant="outline" className={cn("text-[10px] h-5", statusColors[task.status])}>
            {statusLabels[task.status]}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7 text-muted-foreground">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Pencil className="mr-2 size-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 size-3.5" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="mr-2 size-3.5" /> Open in new tab
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 size-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="size-7 text-muted-foreground" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="px-5 py-4">
          {/* Title */}
          <h2 className="text-lg font-semibold text-foreground leading-snug">{task.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{task.description}</p>
        </div>

        <Separator />

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 px-5 py-4">
          <MetaItem icon={User} label="Assignee">
            {assignee && (
              <div className="flex items-center gap-2">
                <Avatar className="size-5">
                  <AvatarFallback className="bg-primary/20 text-primary text-[9px] font-medium">
                    {assignee.avatar}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground">{assignee.name}</span>
              </div>
            )}
          </MetaItem>

          <MetaItem icon={User} label="Creator">
            {creator && (
              <div className="flex items-center gap-2">
                <Avatar className="size-5">
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-[9px] font-medium">
                    {creator.avatar}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground">{creator.name}</span>
              </div>
            )}
          </MetaItem>

          <MetaItem icon={Flag} label="Priority">
            <Badge className={cn("text-xs h-5", priorityColors[task.priority])}>
              {priorityLabels[task.priority]}
            </Badge>
          </MetaItem>

          <MetaItem icon={FolderOpen} label="Project">
            {projectName && (
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-sm" style={{ backgroundColor: project?.color ?? undefined }} />
                <span className="text-sm text-foreground">{projectName}</span>
              </div>
            )}
          </MetaItem>

          <MetaItem icon={Calendar} label="Deadline">
            <span className="text-sm text-foreground">
              {new Date(task.deadline).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </MetaItem>

          <MetaItem icon={Clock} label="Time">
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground">{task.timeSpent}h / {task.timeEstimate}h</span>
            </div>
          </MetaItem>

          <MetaItem icon={Tag} label="Tags" className="col-span-2">
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs bg-secondary/70 text-muted-foreground">
                  {tag}
                </Badge>
              ))}
            </div>
          </MetaItem>
        </div>

        <Separator />

        {/* Time Progress */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Time Progress</span>
            <span className="text-xs text-muted-foreground">
              {task.timeEstimate > 0 ? Math.round((task.timeSpent / task.timeEstimate) * 100) : 0}%
            </span>
          </div>
          <Progress
            value={task.timeEstimate > 0 ? (task.timeSpent / task.timeEstimate) * 100 : 0}
            className="h-2"
          />
        </div>

        <Separator />

        {/* Subtasks */}
        {task.subtasks.length > 0 && (
          <>
            <div className="px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  <CheckSquare className="size-4" />
                  Subtasks
                </span>
                <span className="text-xs text-muted-foreground">{subtasksDone}/{subtasksTotal}</span>
              </div>
              <Progress value={progress} className="h-1.5 mb-3" />
              <div className="flex flex-col gap-2">
                {task.subtasks.map((subtask) => (
                  <label
                    key={subtask.id}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors cursor-pointer",
                      subtask.done
                        ? "text-muted-foreground line-through bg-transparent"
                        : "text-foreground hover:bg-accent/50"
                    )}
                  >
                    {subtask.done ? (
                      <CheckSquare className="size-4 shrink-0 text-success" />
                    ) : (
                      <Square className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    {subtask.title}
                  </label>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Activity / Comments */}
        <div className="px-5 py-4">
          <span className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
            <MessageSquare className="size-4" />
            Activity
            {task.comments.length > 0 && (
              <span className="text-xs text-muted-foreground">({task.comments.length})</span>
            )}
          </span>

          <div className="flex flex-col gap-3">
            {task.comments.map((comment) => {
              const user = getUserById(comment.userId)
              return (
                <div key={comment.id} className="flex gap-2.5">
                  <Avatar className="size-7 shrink-0 mt-0.5">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-[9px] font-medium">
                      {user?.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-foreground">{user?.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              )
            })}

            {task.comments.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No activity yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Comment Input */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2">
          <Avatar className="size-7 shrink-0">
            <AvatarFallback className="bg-primary/20 text-primary text-[9px] font-medium">AP</AvatarFallback>
          </Avatar>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full rounded-md border border-border bg-input py-2 pl-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 size-7 text-muted-foreground hover:text-primary"
            >
              <Send className="size-3.5" />
              <span className="sr-only">Send comment</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetaItem({
  icon: Icon,
  label,
  children,
  className,
}: {
  icon: typeof User
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </span>
      {children}
    </div>
  )
}
