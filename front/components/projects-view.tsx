"use client"

import { useState } from "react"
import {
  FolderOpen,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  ListTodo,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useTaskContext } from "@/lib/task-context"
import { cn } from "@/lib/utils"

interface ProjectsViewProps {
  onCreateProject: () => void
}

export function ProjectsView({ onCreateProject }: ProjectsViewProps) {
  const { projects, tasks, users, deleteProject } = useTaskContext()

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <FolderOpen className="size-4 text-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Projects</h2>
          <Badge variant="secondary" className="text-[10px] h-5 bg-secondary text-muted-foreground">
            {projects.length}
          </Badge>
        </div>
        <Button size="sm" className="gap-1.5 text-xs" onClick={onCreateProject}>
          <Plus className="size-3.5" />
          New Project
        </Button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id)
            const activeTasks = projectTasks.filter((t) => t.status !== "done")
            const doneTasks = projectTasks.filter((t) => t.status === "done")
            const progress = projectTasks.length > 0
              ? (doneTasks.length / projectTasks.length) * 100
              : 0

            // Get unique assignees for this project
            const assigneeIds = [...new Set(projectTasks.map((t) => t.assigneeId))]
            const assignees = assigneeIds
              .map((id) => users.find((u) => u.id === id))
              .filter(Boolean)
              .slice(0, 4)

            return (
              <Card
                key={project.id}
                className="border-border bg-card transition-all hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 overflow-hidden"
              >
                {/* Color bar */}
                <div className="h-1" style={{ backgroundColor: project.color }} />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex size-9 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${project.color}20` }}
                      >
                        <FolderOpen className="size-4" style={{ color: project.color }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{project.name}</h3>
                        {project.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{project.description}</p>
                        )}
                      </div>
                    </div>
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteProject(project.id)}
                        >
                          <Trash2 className="mr-2 size-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-muted-foreground">Progress</span>
                      <span className="text-[10px] font-medium text-foreground">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1.5">
                      <ListTodo className="size-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{projectTasks.length} tasks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3 text-warning" />
                      <span className="text-xs text-muted-foreground">{activeTasks.length} active</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="size-3 text-success" />
                      <span className="text-xs text-muted-foreground">{doneTasks.length} done</span>
                    </div>
                  </div>

                  {/* Assignees */}
                  {assignees.length > 0 && (
                    <div className="flex items-center gap-1 pt-2 border-t border-border/50">
                      <div className="flex -space-x-1.5">
                        {assignees.map((user) => (
                          <Avatar key={user!.id} className="size-6 ring-2 ring-card">
                            <AvatarFallback className="bg-primary/20 text-primary text-[9px] font-medium">
                              {user!.avatar}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      {assigneeIds.length > 4 && (
                        <span className="text-[10px] text-muted-foreground ml-1">
                          +{assigneeIds.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}

          {/* Add project card */}
          <button
            onClick={onCreateProject}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/30 hover:bg-accent/20"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-secondary">
              <Plus className="size-5 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Create New Project</span>
          </button>
        </div>
      </div>
    </div>
  )
}
