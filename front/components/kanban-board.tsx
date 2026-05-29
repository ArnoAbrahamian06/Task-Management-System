"use client"

import { useState, useEffect } from "react"

import { Plus, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TaskCard } from "@/components/task-card"
import { type Task, type Status, statusLabels } from "@/lib/data"
import { cn } from "@/lib/utils"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { useTaskContext } from "@/lib/task-context"

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
  const { updateTask, projects, isTeamLeadOfProject } = useTaskContext()
  const isAnyProjectLead = projects.some(p => isTeamLeadOfProject(p.id))
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(true)
  }, [])

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const taskId = draggableId
    const newStatus = destination.droppableId as Status

    console.log(`Dragging task ${taskId} from ${source.droppableId} to ${newStatus}`)
    
    // Optimistically update status is handled by TaskContext's setTasks usually
    // but here we call updateTask which will update the backend and then the context
    void updateTask(taskId, { status: newStatus })
  }

  if (!enabled) return null

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-full gap-4 overflow-x-auto p-4 pb-6 scrollbar-hide">
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
              isTeamLeadOfProject={isTeamLeadOfProject}
              isAnyProjectLead={isAnyProjectLead}
            />
          )
        })}
      </div>
    </DragDropContext>
  )
}

interface KanbanColumnProps {
  status: Status
  tasks: Task[]
  colorClass: string
  dotColor: string
  onTaskClick: (task: Task) => void
  isTeamLeadOfProject: (projectId: string) => boolean
  isAnyProjectLead: boolean
}

function KanbanColumn({ status, tasks, colorClass, dotColor, onTaskClick, isTeamLeadOfProject, isAnyProjectLead }: KanbanColumnProps) {
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
          {isAnyProjectLead && (
            <Button variant="ghost" size="icon" className="size-6 text-muted-foreground hover:text-foreground">
              <Plus className="size-3.5" />
              <span className="sr-only">Add task</span>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="size-6 text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="size-3.5" />
            <span className="sr-only">Column menu</span>
          </Button>
        </div>
      </div>

      {/* Tasks */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <ScrollArea 
            className={cn(
              "flex-1 px-2 pb-2 transition-colors",
              snapshot.isDraggingOver && "bg-primary/5"
            )}
          >
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex flex-col gap-2 px-1 min-h-[100px]"
            >
              {tasks.map((task, index) => (
                <Draggable 
                  key={task.id} 
                  draggableId={task.id} 
                  index={index}
                  isDragDisabled={!isTeamLeadOfProject(task.projectId)}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={cn(
                        "transition-transform",
                        snapshot.isDragging && "z-50"
                      )}
                    >
                      <TaskCard
                        task={task}
                        onClick={() => onTaskClick(task)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {tasks.length === 0 && !snapshot.isDraggingOver && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-8 text-center opacity-50">
                  <p className="text-xs text-muted-foreground">No tasks</p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </Droppable>
    </div>
  )
}
