"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TaskProvider, useTaskContext } from "@/lib/task-context"
import { AppSidebar } from "@/components/app-sidebar"
import { TopHeader } from "@/components/top-header"
import { KanbanBoard } from "@/components/kanban-board"
import { TaskListView } from "@/components/task-list-view"
import { DashboardView } from "@/components/dashboard-view"
import { TaskDetailPanel } from "@/components/task-detail-panel"
import { SettingsView } from "@/components/settings-view"
import { TeamView } from "@/components/team-view"
import { NotificationsView } from "@/components/notifications-view"
import { ProjectsView } from "@/components/projects-view"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { AuthView } from "@/components/auth-view"
import type { Task } from "@/lib/data"

const viewTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Overview of your workspace" },
  kanban: { title: "Kanban Board", subtitle: "Visual task management" },
  list: { title: "Task List", subtitle: "All tasks in one view" },
  projects: { title: "Projects", subtitle: "Manage your projects" },
  team: { title: "Team", subtitle: "Your team members" },
  notifications: { title: "Notifications", subtitle: "Stay up to date" },
  settings: { title: "Settings", subtitle: "Configure your workspace" },
}

export default function Page() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  )
}

function AppContent() {
  const { tasks, loading, user, authenticated, authLoading, login, register, logout } = useTaskContext()
  const [activeView, setActiveView] = useState("dashboard")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [createProjectOpen, setCreateProjectOpen] = useState(false)

  const headerInfo = viewTitles[activeView] || { title: "TaskFlow", subtitle: "" }

  if (authLoading) {
    return (
      <div className="flex h-svh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return <AuthView onLogin={login} onRegister={register} />
  }

  // Keep selected task in sync with context
  const currentSelectedTask = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) || null
    : null

  if (loading) {
    return (
      <div className="flex h-svh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar
          activeView={activeView}
          onViewChange={setActiveView}
          onCreateProject={() => setCreateProjectOpen(true)}
        />
        <SidebarInset>
          <div className="flex h-svh flex-col overflow-hidden">
            <TopHeader
              title={headerInfo.title}
              subtitle={headerInfo.subtitle}
              onCreateTask={() => setCreateTaskOpen(true)}
              onNotificationsClick={() => setActiveView("notifications")}
              currentUser={user ?? undefined}
              onLogout={logout}
            />

            <div className="flex flex-1 overflow-hidden">
              {/* Main Content */}
              <div className="flex-1 overflow-auto">
                {activeView === "dashboard" && (
                  <DashboardView onTaskClick={setSelectedTask} />
                )}
                {activeView === "kanban" && (
                  <KanbanBoard onTaskClick={setSelectedTask} />
                )}
                {activeView === "list" && (
                  <TaskListView onTaskClick={setSelectedTask} />
                )}
                {activeView === "projects" && (
                  <ProjectsView onCreateProject={() => setCreateProjectOpen(true)} />
                )}
                {activeView === "team" && <TeamView />}
                {activeView === "notifications" && <NotificationsView />}
                {activeView === "settings" && <SettingsView />}
              </div>

              {/* Task Detail Panel */}
              {currentSelectedTask && (
                <TaskDetailPanel
                  task={currentSelectedTask}
                  onClose={() => setSelectedTask(null)}
                />
              )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>

      <CreateTaskDialog open={createTaskOpen} onOpenChange={setCreateTaskOpen} />
      <CreateProjectDialog open={createProjectOpen} onOpenChange={setCreateProjectOpen} />
    </>
  )
}
