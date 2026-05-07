"use client"

import { Plus, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TaskCard } from "@/components/task-card"
import { type Task, type Status, statusLabels } from "@/lib/data"
import { cn } from "@/lib/utils"

interface KanbanBoardProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
}

const columnConfig: { status: Status; color: string; dotColor: string }[] = [
  { status: "new", color: "border-t-info", dotColor: "bg-info" },
  { status: "in_progress", color: "border-t-warning", dotColor: "bg-warning" },
  { status: "review", color: "border-t-chart-3", dotColor: "bg-chart-3" },
  { status: "done", color: "border-t-success", dotColor: "bg-success" },
  { status: "deferred", color: "border-t-muted-foreground", dotColor: "bg-muted-foreground" },
]

export function KanbanBoard({ tasks, onTaskClick }: KanbanBoardProps) {
  return (
    <div className="flex h-full gap-4 overflow-x-auto p-4 pb-6">
      {columnConfig.map(({ status, color, dotColor }) => {
        const columnTasks = (tasks || []).filter((t) => t.status === status)
        return (
          <KanbanColumn
            key={status}
            status={status}
            tasks={columnTasks}
            colorClass={color}
            dotColor={dotColor}
            onTaskClick={onTaskClick}
          />
        )
      })}
    </div>
  )
}

interface KanbanColumnProps {
  status: Status
  tasks: Task[]
  colorClass: string
  dotColor: string
  onTaskClick: (task: Task) => void
}

function KanbanColumn({ status, tasks, colorClass, dotColor, onTaskClick }: KanbanColumnProps) {
  return (
    <div className={cn(
      "flex w-72 shrink-0 flex-col rounded-xl border-t-2 bg-secondary/30",
      colorClass
    )}>
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", dotColor)} />
          <h3 className="text-sm font-medium text-foreground">
            {statusLabels[status]}
          </h3>
          <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="size-6 text-muted-foreground hover:text-foreground">
            <Plus className="size-3.5" />
            <span className="sr-only">Add task</span>
          </Button>
          <Button variant="ghost" size="icon" className="size-6 text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="size-3.5" />
            <span className="sr-only">Column menu</span>
          </Button>
        </div>
      </div>

      {/* Tasks */}
      <ScrollArea className="flex-1 px-2 pb-2">
        <div className="flex flex-col gap-2 px-1">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-8 text-center">
              <p className="text-xs text-muted-foreground">No tasks</p>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                <Plus className="mr-1 size-3" />
                Add task
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
