"use client"

import { useState, useEffect } from "react"
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
import { AdminView } from "@/components/admin-view"
import { AdminAnalyticsView } from "@/components/admin-analytics-view"
import { AdminLogsView } from "@/components/admin-logs-view"
import type { Task } from "@/lib/data"

const viewTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Overview of your workspace" },
  kanban: { title: "Kanban Board", subtitle: "Visual task management" },
  list: { title: "Task List", subtitle: "All tasks in one view" },
  projects: { title: "Projects", subtitle: "Manage your projects" },
  team: { title: "Team", subtitle: "Your team members" },
  notifications: { title: "Notifications", subtitle: "Stay up to date" },
  settings: { title: "Settings", subtitle: "Configure your workspace" },
  admin_analytics: { title: "System Analytics", subtitle: "Core metrics and live system performance" },
  admin_users: { title: "Users Directory", subtitle: "Administer user directory and permissions" },
  admin_projects: { title: "Projects Registry", subtitle: "Global view and control of projects" },
  admin_tasks: { title: "Global Tasks Registry", subtitle: "Monitor and manage all workspace tasks" },
  admin_logs: { title: "System Audit Logs", subtitle: "Real-time audit log of system events" },
}

export default function Page() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  )
}

function AppContent() {
  const { tasks, projects, isTeamLeadOfProject, loading, user, authenticated, authLoading, login, register, logout } = useTaskContext()
  const [activeView, setActiveView] = useState("dashboard")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [createProjectOpen, setCreateProjectOpen] = useState(false)

  // Redirect admin to Admin Panel by default (Overview & Analytics)
  useEffect(() => {
    const adminViews = ["admin_analytics", "admin_users", "admin_projects", "admin_tasks", "admin_logs", "settings", "notifications"]
    if (user?.role?.toUpperCase() === "ADMIN" && !adminViews.includes(activeView)) {
      setActiveView("admin_analytics")
    }
  }, [user, activeView])

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
              onCreateTask={projects.some(p => isTeamLeadOfProject(p.id)) ? () => setCreateTaskOpen(true) : undefined}
              onNotificationsClick={() => setActiveView("notifications")}
              currentUser={user ?? undefined}
              onLogout={logout}
            />

            <div className="flex flex-1 overflow-hidden">
              {/* Main Content */}
              <div className="flex-1 overflow-auto scrollbar-hide">
                {activeView === "dashboard" && (
                  <DashboardView onTaskClick={setSelectedTask} />
                )}
                {activeView === "kanban" && (
                  <KanbanBoard onTaskClick={setSelectedTask} tasks={tasks} />
                )}
                {activeView === "list" && (
                  <TaskListView onTaskClick={setSelectedTask} tasks={tasks} />
                )}
                {activeView === "projects" && (
                  <ProjectsView onCreateProject={() => setCreateProjectOpen(true)} />
                )}
                {activeView === "team" && <TeamView />}
                {activeView === "notifications" && <NotificationsView />}
                {activeView === "settings" && <SettingsView />}
                {activeView === "admin" && <AdminView />}
                {activeView === "admin_analytics" && <AdminAnalyticsView />}
                {activeView === "admin_users" && <AdminView initialTab="users" />}
                {activeView === "admin_projects" && <AdminView initialTab="projects" />}
                {activeView === "admin_tasks" && <AdminView initialTab="tasks" />}
                {activeView === "admin_logs" && <AdminLogsView />}
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
