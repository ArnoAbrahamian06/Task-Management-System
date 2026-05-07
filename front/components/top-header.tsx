"use client"

import { Bell, Plus, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { User } from "@/lib/data"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface TopHeaderProps {
  title: string
  subtitle?: string
  onCreateTask?: () => void
  currentUser?: User
  onLogout?: () => void
}

export function TopHeader({ title, subtitle, onCreateTask, currentUser, onLogout }: TopHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div className="hidden h-6 w-px bg-border sm:block" />
        <div className="hidden sm:block">
          <h1 className="text-sm font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
          <Search className="size-4" />
          <span className="sr-only">Search</span>
        </Button>

        {/* Filter */}
        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
          <Filter className="size-4" />
          <span className="sr-only">Filter</span>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative size-8 text-muted-foreground hover:text-foreground">
              <Bell className="size-4" />
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                3
              </span>
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">Notifications</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <span className="text-sm">New task assigned to you</span>
              <span className="text-xs text-muted-foreground">2 minutes ago</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <span className="text-sm">Comment on "API rate limiting"</span>
              <span className="text-xs text-muted-foreground">1 hour ago</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <span className="text-sm">Task deadline approaching</span>
              <span className="text-xs text-muted-foreground">3 hours ago</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden h-6 w-px bg-border sm:block" />

        {/* Create Task */}
        <Button
          size="sm"
          className="hidden gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 sm:flex"
          onClick={onCreateTask}
        >
          <Plus className="size-3.5" />
          New Task
        </Button>

        <Button
          size="icon"
          className="size-8 bg-primary text-primary-foreground hover:bg-primary/90 sm:hidden"
          onClick={onCreateTask}
        >
          <Plus className="size-3.5" />
          <span className="sr-only">New Task</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <Avatar className="size-7">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
                  {currentUser?.avatar ?? "GU"}
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">{currentUser?.name ?? "Guest"}</p>
              <p className="text-xs text-muted-foreground">{currentUser?.email ?? ""}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-destructive">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
