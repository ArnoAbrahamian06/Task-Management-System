"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import {
  Users,
  Search,
  UserPlus,
  Mail,
  MoreHorizontal,
  Briefcase,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTaskContext } from "@/lib/task-context"
import { cn } from "@/lib/utils"

const roleColors: Record<string, string> = {
  "TEAM_LEAD": "bg-primary/15 text-primary",
  "Team Lead": "bg-primary/15 text-primary",
  "Tech Lead": "bg-primary/15 text-primary",
  "Frontend Developer": "bg-info/15 text-info",
  "Backend Developer": "bg-success/15 text-success",
  "Fullstack Developer": "bg-success/15 text-success",
  "Mobile Developer": "bg-info/15 text-info",
  "Designer": "bg-chart-3/15 text-chart-3",
  "QA Engineer": "bg-warning/15 text-warning",
  "DevOps Engineer": "bg-chart-2/15 text-chart-2",
  "Data Scientist": "bg-chart-4/15 text-chart-4",
  "System Analyst": "bg-chart-5/15 text-chart-5",
  "Business Analyst": "bg-chart-5/15 text-chart-5",
  "Project Manager": "bg-destructive/15 text-destructive",
  "Product Manager": "bg-destructive/15 text-destructive",
  "MEMBER": "bg-secondary text-muted-foreground",
}

export function TeamView() {
  const { toast } = useToast()
  const { teamMembers, tasks, teams, user: currentUser, inviteUser, removeTeamMember } = useTaskContext()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [inviteOpen, setInviteOpen] = useState(false)

  // State for the invite dialog
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("MEMBER")
  const [selectedTeamId, setSelectedTeamId] = useState("")
  const [inviteError, setInviteError] = useState("")
  const [inviteSuccess, setInviteSuccess] = useState("")

  const leadTeams = teams.filter((t) =>
    t.members.some((m) => m.userId === currentUser?.id && m.role === "TEAM_LEAD")
  )
  const isTeamLead = leadTeams.length > 0

  useEffect(() => {
    if (leadTeams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(leadTeams[0].teamId)
    }
  }, [leadTeams, selectedTeamId])

  const handleSendInvite = async () => {
    if (!inviteEmail) {
      setInviteError("Email address is required")
      return
    }
    if (!selectedTeamId) {
      setInviteError("Please select a team")
      return
    }

    try {
      setInviteError("")
      setInviteSuccess("")
      await inviteUser(selectedTeamId, inviteEmail, inviteRole)
      setInviteSuccess("Приглашение успешно отправлено!")
      setInviteEmail("")
      setTimeout(() => {
        setInviteOpen(false)
        setInviteSuccess("")
      }, 1500)
    } catch (err: any) {
      console.error(err)
      setInviteError(err.message || "Не удалось отправить приглашение")
    }
  }

  const handleKick = async (teamId: string, userId: string, userName: string, teamName: string) => {
    if (!confirm(`Вы действительно хотите выгнать ${userName} из команды ${teamName}?`)) {
      return
    }
    try {
      await removeTeamMember(teamId, userId)
      toast({
        title: "Успешно",
        description: `Участник ${userName} был успешно исключен из команды ${teamName}`,
      })
    } catch (err: any) {
      toast({
        title: "Ошибка",
        description: err.message || "Не удалось исключить участника",
        variant: "destructive",
      })
    }
  }

  const roles = [...new Set(teamMembers.map((u) => u.role))]

  const filteredUsers = teamMembers
    .filter((u) => filterRole === "all" || u.role === filterRole)
    .filter((u) =>
      searchQuery === "" ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const activeTasks = tasks.filter((t) => t.status !== "done")
  const totalActive = teamMembers.filter((u) =>
    activeTasks.some((t) => t.assigneeId === u.id)
  ).length

  return (
    <div className="flex h-full flex-col">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-card/50 px-4 py-3">
        <div className="flex items-center gap-6">
          <StatPill icon={Users} label="Total Members" value={teamMembers.length} />
          <StatPill icon={CheckCircle2} label="Active Now" value={totalActive} />
          <StatPill icon={Clock} label="Tasks In Progress" value={activeTasks.length} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-border bg-input py-1.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterRole("all")}
            className={cn(
              "rounded-full px-3 py-1 text-xs transition-colors",
              filterRole === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={cn(
                "rounded-full px-3 py-1 text-xs transition-colors",
                filterRole === role
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {role}
            </button>
          ))}
        </div>

        {isTeamLead && (
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="ml-auto gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
                <UserPlus className="size-3.5" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription className="sr-only">Invite a new member to your team.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                {inviteError && (
                  <div className="rounded-md bg-destructive/10 p-2.5 text-xs text-destructive border border-destructive/20">
                    {inviteError}
                  </div>
                )}
                {inviteSuccess && (
                  <div className="rounded-md bg-success/10 p-2.5 text-xs text-success border border-success/20">
                    {inviteSuccess}
                  </div>
                )}
                {leadTeams.length > 1 && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Select Team</label>
                    <select
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                      className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {leadTeams.map((t) => (
                        <option key={t.teamId} value={t.teamId}>{t.teamName}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Email address</label>
                  <input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="MEMBER">Member (Generic)</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Fullstack Developer">Fullstack Developer</option>
                    <option value="Mobile Developer">Mobile Developer</option>
                    <option value="Designer">Designer (UI/UX)</option>
                    <option value="QA Engineer">QA Engineer</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="System Analyst">System Analyst</option>
                    <option value="Business Analyst">Business Analyst</option>
                    <option value="Project Manager">Project Manager (PM)</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Tech Lead">Tech Lead</option>
                    <option value="TEAM_LEAD">Team Lead</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                <Button onClick={handleSendInvite} className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Mail className="size-3.5" />
                  Send Invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Team grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => {
            const userActiveTasks = tasks.filter(
              (t) => t.assigneeId === user.id && t.status !== "done"
            )
            const userCompletedTasks = tasks.filter(
              (t) => t.assigneeId === user.id && t.status === "done"
            )

            return (
              <Card key={user.id} className="border-border bg-card transition-all hover:border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                          {user.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-sm font-medium text-foreground">{user.name}</h3>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7 text-muted-foreground">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Send Message</DropdownMenuItem>
                        <DropdownMenuItem>Assign Task</DropdownMenuItem>
                        {(() => {
                          const teamsWeCanKickFrom = teams.filter((t) => {
                            const isCurrentUserLead = t.members.some(
                              (m) => m.userId === currentUser?.id && m.role === "TEAM_LEAD"
                            )
                            const isTargetUserMember = t.members.some(
                              (m) => m.userId === user.id
                            )
                            return isCurrentUserLead && isTargetUserMember && user.id !== currentUser?.id
                          })

                          if (teamsWeCanKickFrom.length === 0) return null

                          return (
                            <>
                              <div className="h-px bg-border my-1" />
                              {teamsWeCanKickFrom.map((t) => (
                                <DropdownMenuItem
                                  key={t.teamId}
                                  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer font-medium"
                                  onClick={() => handleKick(t.teamId, user.id, user.name, t.teamName)}
                                >
                                  Выгнать из {t.teamName}
                                </DropdownMenuItem>
                              ))}
                            </>
                          )
                        })()}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={cn("text-[10px] h-5", roleColors[user.role] || "bg-secondary text-muted-foreground")}>
                      <Briefcase className="size-3 mr-1" />
                      {user.role}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3 text-warning" />
                      <span className="text-xs text-muted-foreground">{userActiveTasks.length} active</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="size-3 text-success" />
                      <span className="text-xs text-muted-foreground">{userCompletedTasks.length} completed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-muted-foreground">No team members match your search</p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatPill({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-8 items-center justify-center rounded-lg bg-secondary">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
}
