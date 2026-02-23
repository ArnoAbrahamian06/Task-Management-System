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
import { projects, users } from "@/lib/data"
import { cn } from "@/lib/utils"

const navMain = [
  { title: "Dashboard", icon: LayoutDashboard, id: "dashboard", badge: null },
  { title: "Kanban Board", icon: KanbanSquare, id: "kanban", badge: null },
  { title: "Task List", icon: ListTodo, id: "list", badge: "12" },
  { title: "Projects", icon: FolderOpen, id: "projects", badge: "4" },
  { title: "Team", icon: Users, id: "team", badge: null },
]

const navSecondary = [
  { title: "Notifications", icon: Bell, id: "notifications", badge: "3" },
  { title: "Settings", icon: Settings, id: "settings", badge: null },
]

interface AppSidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function AppSidebar({ activeView, onViewChange }: AppSidebarProps) {
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

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
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
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  {item.badge && (
                    <SidebarMenuBadge className="bg-primary/15 text-primary text-[10px] rounded-full px-1.5">
                      {item.badge}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Projects */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Projects</span>
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

        <SidebarSeparator />

        {/* Secondary */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navSecondary.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton tooltip={item.title}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  {item.badge && (
                    <SidebarMenuBadge className="bg-destructive/15 text-destructive text-[10px] rounded-full px-1.5">
                      {item.badge}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip={users[0].name}>
              <Avatar className="size-7">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
                  {users[0].avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{users[0].name}</span>
                <span className="text-xs text-muted-foreground">{users[0].role}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
