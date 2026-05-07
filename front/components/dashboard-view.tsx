"use client"

import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ListTodo,
  Users,
  FolderOpen,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  statusLabels,
  priorityLabels,
  type Task,
} from "@/lib/data"
import { useTaskContext } from "@/lib/task-context"
import { cn } from "@/lib/utils"

interface DashboardViewProps {
  onTaskClick: (task: Task) => void
}

export function DashboardView({ onTaskClick }: DashboardViewProps) {
  const { 
    tasks, 
    users, 
    projects, 
    teamMembers, 
    getUserById, 
    getProjectById,
    totalTasksCount,
    completedTasksCount,
    inProgressTasksCount,
    overdueTasksCount
  } = useTaskContext()

  const totalTasks = totalTasksCount
  const completedTasks = completedTasksCount
  const inProgressTasks = inProgressTasksCount
  const overdueTasks = overdueTasksCount

  const urgentTasks = tasks
    .filter((t) => t.status !== "done" && (t.priority === "urgent" || t.priority === "high"))
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5)

  const recentActivity = tasks
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatsCard
          icon={ListTodo}
          label="Total Tasks"
          value={totalTasks}
          trend="+3 this week"
          trendUp={true}
          iconColor="text-info"
          iconBg="bg-info/10"
        />
        <StatsCard
          icon={CheckCircle2}
          label="Completed"
          value={completedTasks}
          trend={`${Math.round((completedTasks / totalTasks) * 100)}% rate`}
          trendUp={true}
          iconColor="text-success"
          iconBg="bg-success/10"
        />
        <StatsCard
          icon={Clock}
          label="In Progress"
          value={inProgressTasks}
          trend="Active now"
          trendUp={true}
          iconColor="text-warning"
          iconBg="bg-warning/10"
        />
        <StatsCard
          icon={AlertTriangle}
          label="Overdue"
          value={overdueTasks}
          trend={overdueTasks > 0 ? "Needs attention" : "All on track"}
          trendUp={overdueTasks === 0}
          iconColor="text-destructive"
          iconBg="bg-destructive/10"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Priority Tasks */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                <Zap className="size-4 text-warning" />
                Priority Tasks
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">
                {urgentTasks.length} tasks
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex flex-col gap-2">
              {urgentTasks.map((task) => {
                const assignee = getUserById(task.assigneeId)
                const project = getProjectById(task.projectId)
                const isOverdue = new Date(task.deadline) < new Date()
                return (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/20 px-3 py-2.5 text-left transition-all hover:bg-accent/40 hover:border-primary/20"
                  >
                    <span className={cn(
                      "size-2 shrink-0 rounded-full",
                      task.priority === "urgent" ? "bg-destructive" : "bg-warning"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {project && (
                          <span className="text-xs text-muted-foreground">{project.name}</span>
                        )}
                        <span className="text-xs text-muted-foreground">{"/"}</span>
                        <span className="text-xs text-muted-foreground">{statusLabels[task.status]}</span>
                      </div>
                    </div>
                    <span className={cn("text-xs shrink-0", isOverdue ? "text-destructive" : "text-muted-foreground")}>
                      {formatDeadline(task.deadline)}
                    </span>
                    {assignee && (
                      <Avatar className="size-6 shrink-0">
                        <AvatarFallback className="bg-primary/20 text-primary text-[9px] font-medium">
                          {assignee.avatar}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Projects Overview */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <FolderOpen className="size-4 text-info" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex flex-col gap-4">
              {projects.map((project) => {
                const progress = project.tasksCount > 0
                  ? (project.completedCount / project.tasksCount) * 100
                  : 0
                return (
                  <div key={project.id} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-sm" style={{ backgroundColor: project.color }} />
                        <span className="text-sm font-medium text-foreground">{project.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {project.completedCount}/{project.tasksCount}
                      </span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="size-4 text-success" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex flex-col gap-3">
              {recentActivity.map((task) => {
                const assignee = getUserById(task.assigneeId)
                return (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="flex items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent/30"
                  >
                    {assignee && (
                      <Avatar className="size-7 shrink-0">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-[9px] font-medium">
                          {assignee.avatar}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        <span className="font-medium">{assignee?.name}</span>
                        <span className="text-muted-foreground">{" updated "}</span>
                        <span className="font-medium">{task.title}</span>
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTimeAgo(task.updatedAt)}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] h-5 shrink-0">
                      {statusLabels[task.status]}
                    </Badge>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <Users className="size-4 text-chart-3" />
              Team
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex flex-col gap-3">
              {teamMembers.map((user) => {
                const userTasks = tasks.filter((t) => t.assigneeId === user.id && t.status !== "done")
                return (
                  <div key={user.id} className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
                        {user.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground">{user.role}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] h-5 bg-secondary/70 text-muted-foreground">
                      {userTasks.length} active
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatsCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
  iconColor,
  iconBg,
}: {
  icon: typeof ListTodo
  label: string
  value: number
  trend: string
  trendUp: boolean
  iconColor: string
  iconBg: string
}) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-2xl font-bold text-foreground">{value}</span>
          </div>
          <div className={cn("flex size-9 items-center justify-center rounded-lg", iconBg)}>
            <Icon className={cn("size-4.5", iconColor)} />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1">
          {trendUp ? (
            <ArrowUpRight className="size-3 text-success" />
          ) : (
            <ArrowDownRight className="size-3 text-destructive" />
          )}
          <span className={cn("text-[10px]", trendUp ? "text-success" : "text-destructive")}>
            {trend}
          </span>
        </div>
      </CardContent>
    </Card>
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

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (hours < 1) return "Just now"
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return "Yesterday"
  return `${days}d ago`
}
