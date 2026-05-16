"use client"

import { useState } from "react"
import {
  ArrowUpDown,
  Filter,
  Search,
  ChevronDown,
  Calendar,
  Clock,
  MessageSquare,
  CheckCircle2,
  Circle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  type Task,
  type Priority,
  type Status,
  statusLabels,
  priorityLabels,
  priorityColors,
  priorityDotColors,
} from "@/lib/data"
import { useTaskContext } from "@/lib/task-context"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TaskListViewProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
}

const priorityDots: Record<string, string> = priorityDotColors

const statusIcons: Record<Status, { icon: typeof Circle; color: string }> = {
  new: { icon: Circle, color: "text-info" },
  in_progress: { icon: Clock, color: "text-warning" },
  review: { icon: ArrowUpDown, color: "text-chart-3" },
  done: { icon: CheckCircle2, color: "text-success" },
  deferred: { icon: Circle, color: "text-muted-foreground" },
}

export function TaskListView({ tasks, onTaskClick }: TaskListViewProps) {
  const { getUserById, getProjectById } = useTaskContext()
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all")
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"deadline" | "priority" | "created">("deadline")

  const filteredTasks = (tasks || [])
    .filter((t) => filterStatus === "all" || t.status === filterStatus)
    .filter((t) => filterPriority === "all" || t.priority === filterPriority)
    .filter((t) => searchQuery === "" || t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "deadline") return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      if (sortBy === "priority") {
        const order = { urgent: 0, high: 1, medium: 2, low: 3 }
        return order[a.priority] - order[b.priority]
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  return (
    <div className="flex h-full flex-col">
      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card/50 px-4 py-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-border bg-input py-1.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Filter className="size-3.5" />
              Status: {filterStatus === "all" ? "All" : statusLabels[filterStatus]}
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterStatus("all")}>All</DropdownMenuItem>
            {Object.entries(statusLabels).map(([key, label]) => (
              <DropdownMenuItem key={key} onClick={() => setFilterStatus(key as Status)}>
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Filter className="size-3.5" />
              Priority: {filterPriority === "all" ? "All" : priorityLabels[filterPriority]}
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterPriority("all")}>All</DropdownMenuItem>
            {Object.entries(priorityLabels).map(([key, label]) => (
              <DropdownMenuItem key={key} onClick={() => setFilterPriority(key as Priority)}>
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowUpDown className="size-3.5" />
              Sort: {sortBy === "deadline" ? "Deadline" : sortBy === "priority" ? "Priority" : "Created"}
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSortBy("deadline")}>Deadline</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("priority")}>Priority</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("created")}>Created</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="ml-auto text-xs text-muted-foreground">
          {filteredTasks.length} tasks
        </span>
      </div>

      {/* Table Header */}
      <div className="hidden items-center gap-4 border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground md:flex">
        <span className="w-6" />
        <span className="flex-1">Task</span>
        <span className="w-28">Project</span>
        <span className="w-20">Priority</span>
        <span className="w-20">Status</span>
        <span className="w-20 text-center">Progress</span>
        <span className="w-24">Deadline</span>
        <span className="w-8">Assignee</span>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-auto">
        {filteredTasks.map((task) => (
          <TaskListItem key={task.id} task={task} onClick={() => onTaskClick(task)} />
        ))}
        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <p className="text-sm text-muted-foreground">No tasks match your filters</p>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                setFilterStatus("all")
                setFilterPriority("all")
                setSearchQuery("")
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function TaskListItem({ task, onClick }: { task: Task; onClick: () => void }) {
  const { getUserById, getProjectById } = useTaskContext()
  const assignee = getUserById(task.assigneeId)
  const project = getProjectById(task.projectId)
  const projectName = project?.name ?? task.projectName
  const subtasksDone = task.subtasks.filter((s) => s.done).length
  const subtasksTotal = task.subtasks.length
  const progress = subtasksTotal > 0 ? (subtasksDone / subtasksTotal) * 100 : 0
  const isOverdue = new Date(task.deadline) < new Date() && task.status !== "done"
  const StatusConfig = statusIcons[task.status]

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 border-b border-border/50 px-4 py-3 text-left transition-colors hover:bg-accent/30"
    >
      {/* Priority dot */}
      <span className={cn("size-2.5 shrink-0 rounded-full", priorityDots[task.priority])} />

      {/* Task info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
          {/* Mobile badges */}
          <div className="flex items-center gap-1 md:hidden">
            <span className={cn("text-xs", StatusConfig.color)}>
              {statusLabels[task.status]}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-0.5 md:hidden">
          {projectName && (
            <span className="text-xs text-muted-foreground">{projectName}</span>
          )}
          <span className={cn("text-xs", isOverdue ? "text-destructive" : "text-muted-foreground")}>
            {formatDate(task.deadline)}
          </span>
        </div>
      </div>

      {/* Desktop columns */}
      <span className="hidden w-28 truncate text-xs text-muted-foreground md:block">
        {projectName && (
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm shrink-0" style={{ backgroundColor: project?.color }} />
            {projectName}
          </span>
        )}
      </span>

      <span className="hidden w-20 md:block">
        <Badge
          variant="outline"
          className={cn("text-[10px] px-1.5 py-0 h-5 font-medium", priorityColors[task.priority])}
        >
          {priorityLabels[task.priority]}
        </Badge>
      </span>

      <span className="hidden w-20 md:flex items-center gap-1.5">
        <StatusConfig.icon className={cn("size-3.5", StatusConfig.color)} />
        <span className="text-xs text-muted-foreground">{statusLabels[task.status]}</span>
      </span>

      <span className="hidden w-20 md:flex items-center gap-1.5 justify-center">
        {subtasksTotal > 0 ? (
          <div className="flex items-center gap-1.5 w-full">
            <Progress value={progress} className="h-1 flex-1" />
            <span className="text-[10px] text-muted-foreground">{Math.round(progress)}%</span>
          </div>
        ) : (
          <span className="text-[10px] text-muted-foreground">-</span>
        )}
      </span>

      <span className={cn(
        "hidden w-24 text-xs md:block",
        isOverdue ? "text-destructive" : "text-muted-foreground"
      )}>
        {formatDate(task.deadline)}
      </span>

      {assignee && (
        <Avatar className="size-6 shrink-0">
          <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-medium">
            {assignee.avatar}
          </AvatarFallback>
        </Avatar>
      )}
    </button>
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
