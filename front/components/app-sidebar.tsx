"use client"

import {
  LayoutDashboard,
  KanbanSquare,
  ListTodo,
  FolderOpen,
  Users,
  Settings,
  Bell,
  Plus,
  ChevronDown,
  Search,
  Zap,
  Shield,
  Activity,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useTaskContext } from "@/lib/task-context"

const navMain = [
  { title: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  { title: "Kanban Board", icon: KanbanSquare, id: "kanban" },
  { title: "Task List", icon: ListTodo, id: "list" },
  { title: "Projects", icon: FolderOpen, id: "projects" },
  { title: "Team", icon: Users, id: "team" },
]

const adminNav = [
  { title: "Overview & Analytics", icon: LayoutDashboard, id: "admin_analytics" },
  { title: "Users Directory", icon: Users, id: "admin_users" },
  { title: "Projects Registry", icon: FolderOpen, id: "admin_projects" },
  { title: "Global Tasks", icon: ListTodo, id: "admin_tasks" },
  { title: "System Audit Logs", icon: Activity, id: "admin_logs" },
]

// Dynamic secondary items based on role

interface AppSidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  onCreateProject?: () => void
}

export function AppSidebar({ activeView, onViewChange, onCreateProject }: AppSidebarProps) {
  const { user, projects, tasks, unreadNotificationsCount, t } = useTaskContext()
  const isAdmin = user?.role?.toLowerCase().includes("admin")
  const secondaryItems = [
    { title: "Notifications", icon: Bell, id: "notifications" },
    { title: "Settings", icon: Settings, id: "settings" },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="size-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-foreground">TaskFlow</span>
            <span className="text-xs text-muted-foreground">Team workspace</span>
          </div>
          <ChevronDown className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {/* Quick search */}
        {!isAdmin && (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <button
              className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary"
            >
              <Search className="size-4" />
              <span>Search...</span>
              <kbd className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {"Ctrl+K"}
              </kbd>
            </button>
          </SidebarGroup>
        )}

        {/* Admin Navigation */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>{t("adminPanel")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNav.map((item) => {
                  const badgeValue =
                    item.id === "admin_tasks"
                      ? tasks.length
                      : item.id === "admin_projects"
                      ? projects.length
                      : null

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={activeView === item.id}
                        onClick={() => onViewChange(item.id)}
                        tooltip={item.title}
                        className={cn(
                          activeView === item.id &&
                            "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                        )}
                      >
                        <item.icon className="size-4" />
                        <span>{t(item.id)}</span>
                      </SidebarMenuButton>
                      {badgeValue !== null && badgeValue > 0 && (
                        <SidebarMenuBadge className="bg-primary/15 text-primary text-[10px] rounded-full px-1.5 font-medium">
                          {badgeValue}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isAdmin && <SidebarSeparator />}

        {/* Main Navigation */}
        {!isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>{t("navigation")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navMain.map((item) => {
                  const badgeValue =
                    item.id === "list"
                      ? tasks.filter((t) => t.status !== "done").length
                      : item.id === "projects"
                      ? projects.length
                      : null

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={activeView === item.id}
                        onClick={() => onViewChange(item.id)}
                        tooltip={item.title}
                        className={cn(
                          activeView === item.id &&
                            "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                        )}
                      >
                        <item.icon className="size-4" />
                        <span>{t(item.id)}</span>
                      </SidebarMenuButton>
                      {badgeValue !== null && badgeValue > 0 && (
                        <SidebarMenuBadge className="bg-primary/15 text-primary text-[10px] rounded-full px-1.5 font-medium">
                          {badgeValue}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!isAdmin && <SidebarSeparator />}

        {/* Projects */}
        {!isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between">
              <span>{t("projects")}</span>
              <button className="rounded p-0.5 hover:bg-accent group-data-[collapsible=icon]:hidden">
                <Plus className="size-3.5" />
              </button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {projects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton tooltip={project.name}>
                      <span
                        className="size-3 rounded-sm shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="truncate">{project.name}</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge className="text-[10px] text-muted-foreground">
                      {project.completedCount}/{project.tasksCount}
                    </SidebarMenuBadge>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!isAdmin && <SidebarSeparator />}

        {/* Secondary */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => {
                const badgeValue =
                  item.id === "notifications"
                    ? unreadNotificationsCount
                    : null

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      tooltip={item.title} 
                      onClick={() => onViewChange(item.id)}
                      isActive={activeView === item.id}
                      className={cn(
                        activeView === item.id &&
                          "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                      )}
                    >
                      <item.icon className="size-4" />
                      <span>{t(item.id)}</span>
                    </SidebarMenuButton>
                    {badgeValue !== null && badgeValue > 0 && (
                      <SidebarMenuBadge className="bg-destructive/15 text-destructive text-[10px] rounded-full px-1.5 font-medium">
                        {badgeValue}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip={user?.name ?? "User"}>
              <Avatar className="size-7">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
                  {user?.avatar ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.name ?? "User"}</span>
                <span className="text-xs text-muted-foreground">{user?.role ?? "Member"}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
