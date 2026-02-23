"use client"

import { useState } from "react"
import {
  Bell,
  CheckCheck,
  Trash2,
  UserPlus,
  MessageSquare,
  Clock,
  ArrowRightLeft,
  AtSign,
  Filter,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTaskContext } from "@/lib/task-context"
import type { NotificationType } from "@/lib/data"
import { cn } from "@/lib/utils"

const typeConfig: Record<NotificationType, { icon: typeof Bell; color: string; bg: string }> = {
  task_assigned: { icon: UserPlus, color: "text-primary", bg: "bg-primary/10" },
  comment_added: { icon: MessageSquare, color: "text-info", bg: "bg-info/10" },
  deadline_approaching: { icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  status_changed: { icon: ArrowRightLeft, color: "text-success", bg: "bg-success/10" },
  mention: { icon: AtSign, color: "text-chart-3", bg: "bg-chart-3/10" },
}

const typeLabels: Record<NotificationType, string> = {
  task_assigned: "Assigned",
  comment_added: "Comments",
  deadline_approaching: "Deadlines",
  status_changed: "Status",
  mention: "Mentions",
}

export function NotificationsView() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
    unreadNotificationsCount,
  } = useTaskContext()
  const [filterType, setFilterType] = useState<NotificationType | "all">("all")

  const filtered = notifications.filter(
    (n) => filterType === "all" || n.type === filterType
  )

  // Group by date
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const groups: { label: string; items: typeof filtered }[] = []
  const todayItems = filtered.filter((n) => isSameDay(new Date(n.createdAt), today))
  const yesterdayItems = filtered.filter((n) => isSameDay(new Date(n.createdAt), yesterday))
  const earlierItems = filtered.filter(
    (n) => !isSameDay(new Date(n.createdAt), today) && !isSameDay(new Date(n.createdAt), yesterday)
  )

  if (todayItems.length > 0) groups.push({ label: "Today", items: todayItems })
  if (yesterdayItems.length > 0) groups.push({ label: "Yesterday", items: yesterdayItems })
  if (earlierItems.length > 0) groups.push({ label: "Earlier", items: earlierItems })

  return (
    <div className="flex h-full flex-col">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
          {unreadNotificationsCount > 0 && (
            <Badge className="bg-destructive/15 text-destructive text-[10px] h-5 rounded-full">
              {unreadNotificationsCount} unread
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={markAllNotificationsRead}
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1.5 text-muted-foreground hover:text-destructive"
            onClick={clearAllNotifications}
          >
            <Trash2 className="size-3.5" />
            Clear all
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Filter className="size-3.5" />
              {filterType === "all" ? "All types" : typeLabels[filterType]}
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterType("all")}>All types</DropdownMenuItem>
            {Object.entries(typeLabels).map(([key, label]) => (
              <DropdownMenuItem key={key} onClick={() => setFilterType(key as NotificationType)}>
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} notifications
        </span>
      </div>

      {/* Notification list */}
      <div className="flex-1 overflow-auto">
        {groups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary mb-3">
              <Bell className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground mt-1">{"You're all caught up!"}</p>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.label}>
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm px-4 py-2 border-b border-border/50">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </span>
            </div>
            {group.items.map((notif) => {
              const config = typeConfig[notif.type]
              const Icon = config.icon
              return (
                <button
                  key={notif.id}
                  onClick={() => !notif.read && markNotificationRead(notif.id)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-border/30 px-4 py-3 text-left transition-colors hover:bg-accent/30",
                    !notif.read && "bg-primary/[0.03]"
                  )}
                >
                  <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg mt-0.5", config.bg)}>
                    <Icon className={cn("size-4", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "text-sm truncate",
                        !notif.read ? "font-medium text-foreground" : "text-muted-foreground"
                      )}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="size-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notif.description}
                    </p>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {formatNotifTime(notif.createdAt)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function formatNotifTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)

  if (diffMin < 1) return "Just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}
