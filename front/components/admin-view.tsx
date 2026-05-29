"use client"

import { useState, useEffect } from "react"
import { useTaskContext } from "@/lib/task-context"
import { useToast } from "@/components/ui/use-toast"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Shield,
  Users,
  FolderOpen,
  Plus,
  Search,
  Trash2,
  UserPlus,
  ShieldCheck,
  Check,
  Loader2,
  Briefcase,
  AlertTriangle,
  Mail,
  Lock,
  UserCheck,
  BarChart3,
  PieChart,
  Activity,
  Layers,
  ListTodo,
  CheckSquare,
  PlusCircle,
  Calendar,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SendNotificationDialog } from "./send-notification-dialog"

export interface AdminViewProps {
  initialTab?: string
}

export function AdminView({ initialTab = "users" }: AdminViewProps) {
  const { toast } = useToast()
  const {
    user: currentUser,
    users,
    tasks,
    projects,
    t,
    settings,
    adminCreateUser,
    adminChangeUserRole,
    adminDeleteUser,
    adminGetProjects,
    adminDeleteProject,
    refreshData,
    updateTask,
    deleteTask,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    addTask,
    addProject,
    updateProject,
    teamMembers,
    teams,
  } = useTaskContext()

  const isRu = settings?.appearance.language === "ru"

  // Local state
  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])
  const [userSearch, setUserSearch] = useState("")
  const [projectSearch, setProjectSearch] = useState("")
  const [taskSearch, setTaskSearch] = useState("")
  const [taskProjectFilter, setTaskProjectFilter] = useState("all")
  const [taskStatusFilter, setTaskStatusFilter] = useState("all")
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("all")
  
  const [adminProjects, setAdminProjects] = useState(projects)
  const [loadingProjects, setLoadingProjects] = useState(false)

  // Create User dialog state
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newRole, setNewRole] = useState<"USER" | "ADMIN">("USER")
  const [submittingUser, setSubmittingUser] = useState(false)

  // Create Project state (Admin inline)
  const [projectCreateOpen, setProjectCreateOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDesc, setNewProjectDesc] = useState("")
  const [newProjectColor, setNewProjectColor] = useState("#4f8ff7")
  const [submittingProject, setSubmittingProject] = useState(false)

  // Create Task state (Admin inline)
  const [taskCreateOpen, setTaskCreateOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDesc, setNewTaskDesc] = useState("")
  const [newTaskStatus, setNewTaskStatus] = useState<"new" | "in_progress" | "review" | "done" | "deferred">("new")
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high" | "urgent">("medium")
  const [newTaskProject, setNewTaskProject] = useState("")
  const [newTaskAssignee, setNewTaskAssignee] = useState("")
  const [newTaskDeadline, setNewTaskDeadline] = useState("")
  const [submittingTask, setSubmittingTask] = useState(false)

  // Checklist management state (Admin subtasks panel)
  const [checklistOpen, setChecklistOpen] = useState(false)
  const [checklistTask, setChecklistTask] = useState<any | null>(null)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [submittingSubtask, setSubmittingSubtask] = useState(false)

  // Confirm delete states
  const [deleteUserTarget, setDeleteUserTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleteProjectTarget, setDeleteProjectTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleteTaskTarget, setDeleteTaskTarget] = useState<{ id: string; title: string } | null>(null)

  // Notification dispatch state
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false)
  const [selectedNotifyUserId, setSelectedNotifyUserId] = useState<string | number | null>(null)

  // Project detail and editing state (Admin Project Control Center)
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [projectManageOpen, setProjectManageOpen] = useState(false)
  const [editProjectName, setEditProjectName] = useState("")
  const [editProjectDesc, setEditProjectDesc] = useState("")
  const [editProjectColor, setEditProjectColor] = useState("")
  const [savingProject, setSavingProject] = useState(false)


  // Fetch complete admin projects list from database
  const loadAdminProjects = async () => {
    setLoadingProjects(true)
    try {
      const list = await adminGetProjects()
      setAdminProjects(list)
    } catch (err) {
      console.error("Failed to load admin projects list", err)
    } finally {
      setLoadingProjects(false)
    }
  }

  useEffect(() => {
    loadAdminProjects()
  }, [])

  useEffect(() => {
    setAdminProjects(projects)
  }, [projects])

  useEffect(() => {
    if (taskCreateOpen && !newTaskProject && projects.length > 0) {
      setNewTaskProject(projects[0].id)
    }
  }, [taskCreateOpen, newTaskProject, projects])

  // Action: Toggle User Role
  const handleToggleRole = async (targetId: string, currentRole: string) => {
    if (targetId === currentUser?.id) {
      toast({
        title: isRu ? "Ошибка" : "Error",
        description: isRu ? "Вы не можете изменить свою собственную роль." : "You cannot change your own role.",
        variant: "destructive",
      })
      return
    }

    const nextRole = currentRole.toUpperCase() === "ADMIN" ? "USER" : "ADMIN"
    try {
      await adminChangeUserRole(targetId, nextRole)
      toast({
        title: isRu ? "Успешно" : "Success",
        description: t("roleChangedSuccess"),
      })
      refreshData()
    } catch (err: any) {
      toast({
        title: isRu ? "Ошибка" : "Error",
        description: err.message || (isRu ? "Не удалось изменить роль" : "Failed to change role"),
        variant: "destructive",
      })
    }
  }

  // Action: Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newEmail || !newPassword) {
      toast({
        title: isRu ? "Ошибка" : "Error",
        description: isRu ? "Все поля обязательны для заполнения." : "All fields are required.",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: isRu ? "Ошибка" : "Error",
        description: isRu ? "Пароль должен состоять минимум из 6 символов." : "Password must be at least 6 characters.",
        variant: "destructive",
      })
      return
    }

    setSubmittingUser(true)
    try {
      await adminCreateUser({
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
      })
      toast({
        title: isRu ? "Успешно" : "Success",
        description: t("userCreatedSuccess"),
      })
      setCreateOpen(false)
      // Reset form
      setNewName("")
      setNewEmail("")
      setNewPassword("")
      setNewRole("USER")
      refreshData()
    } catch (err: any) {
      toast({
        title: isRu ? "Ошибка" : "Error",
        description: err.message || (isRu ? "Не удалось создать пользователя" : "Failed to create user"),
        variant: "destructive",
      })
    } finally {
      setSubmittingUser(false)
    }
  }

  // Action: Delete User
  const handleDeleteUser = async () => {
    if (!deleteUserTarget) return
    try {
      await adminDeleteUser(deleteUserTarget.id)
      toast({
        title: isRu ? "Успешно" : "Success",
        description: t("userDeletedSuccess"),
      })
      setDeleteUserTarget(null)
      refreshData()
    } catch (err: any) {
      toast({
        title: isRu ? "Ошибка" : "Error",
        description: err.message || (isRu ? "Не удалось удалить пользователя" : "Failed to delete user"),
        variant: "destructive",
      })
    }
  }

  // Action: Delete Project
  const handleDeleteProject = async () => {
    if (!deleteProjectTarget) return
    try {
      await adminDeleteProject(deleteProjectTarget.id)
      toast({
        title: isRu ? "Успешно" : "Success",
        description: t("projectDeletedSuccess"),
      })
      setDeleteProjectTarget(null)
      loadAdminProjects()
      refreshData()
    } catch (err: any) {
      toast({
        title: isRu ? "Ошибка" : "Error",
        description: err.message || (isRu ? "Не удалось удалить проект" : "Failed to delete project"),
        variant: "destructive",
      })
    }
  }

  // Action: Create Project (Admin inline)
  const handleCreateProjectAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim()) return
    setSubmittingProject(true)
    try {
      await addProject({
        name: newProjectName.trim(),
        description: newProjectDesc.trim() || undefined,
        color: newProjectColor,
      })
      toast({
        title: isRu ? "Успешно" : "Success",
        description: isRu ? "Проект успешно создан!" : "Project created successfully!",
      })
      setProjectCreateOpen(false)
      setNewProjectName("")
      setNewProjectDesc("")
      setNewProjectColor("#4f8ff7")
      loadAdminProjects()
      refreshData()
    } catch (err: any) {
      toast({
        title: isRu ? "Ошибка" : "Error",
        description: err.message || (isRu ? "Не удалось создать проект" : "Failed to create project"),
        variant: "destructive",
      })
    } finally {
      setSubmittingProject(false)
    }
  }

  // Action: Open Project Details Control Center
  const handleOpenProjectManage = (p: any) => {
    setSelectedProject(p)
    setEditProjectName(p.name)
    setEditProjectDesc(p.description || "")
    setEditProjectColor(p.color || "#4f8ff7")
    setProjectManageOpen(true)
  }

  // Action: Save Project Updates
  const handleUpdateProjectAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject || !editProjectName.trim()) return
    setSavingProject(true)
    try {
      await updateProject(selectedProject.id, {
        name: editProjectName.trim(),
        description: editProjectDesc.trim() || undefined,
        color: editProjectColor,
      })
      toast({
        title: isRu ? "Успешно" : "Success",
        description: isRu ? "Проект обновлен!" : "Project updated successfully!",
      })
      setProjectManageOpen(false)
      loadAdminProjects()
      refreshData()
    } catch (err: any) {
      toast({
        title: isRu ? "Ошибка" : "Error",
        description: err.message || (isRu ? "Не удалось обновить проект" : "Failed to update project"),
        variant: "destructive",
      })
    } finally {
      setSavingProject(false)
    }
  }

  // Action: Create Task (Admin inline)
  const handleCreateTaskAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim() || !newTaskProject) {
      toast({
        title: isRu ? "Ошибка" : "Error",
        description: isRu ? "Название и проект обязательны." : "Title and project are required.",
        variant: "destructive",
      })
      return
    }
    setSubmittingTask(true)
    try {
      await addTask({
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
        status: newTaskStatus,
        priority: newTaskPriority,
        projectId: newTaskProject,
        assigneeId: newTaskAssignee || undefined,
        deadline: newTaskDeadline || undefined,
      })
      toast({
        title: isRu ? "Успешно" : "Success",
        description: isRu ? "Задача успешно создана!" : "Task created successfully!",
      })
      setTaskCreateOpen(false)
      setNewTaskTitle("")
      setNewTaskDesc("")
      setNewTaskStatus("new")
      setNewTaskPriority("medium")
      setNewTaskProject("")
      setNewTaskAssignee("")
      setNewTaskDeadline("")
      refreshData()
    } catch (err: any) {
      toast({
        title: isRu ? "Ошибка" : "Error",
        description: err.message || (isRu ? "Не удалось создать задачу" : "Failed to create task"),
        variant: "destructive",
      })
    } finally {
      setSubmittingTask(false)
    }
  }

  // Action: Delete Task (Admin inline)
  const handleDeleteTaskAdmin = async () => {
    if (!deleteTaskTarget) return
    try {
      await deleteTask(deleteTaskTarget.id)
      toast({
        title: isRu ? "Успешно" : "Success",
        description: isRu ? "Задача успешно удалена!" : "Task deleted successfully!",
      })
      setDeleteTaskTarget(null)
      refreshData()
    } catch (err: any) {
      toast({
        title: isRu ? "Ошибка" : "Error",
        description: err.message || (isRu ? "Не удалось удалить задачу" : "Failed to delete task"),
        variant: "destructive",
      })
    }
  }

  // Action: Toggle Subtask (Admin checklist)
  const handleToggleSubtaskAdmin = async (subtaskId: string) => {
    if (!checklistTask) return
    try {
      await toggleSubtask(checklistTask.id, subtaskId)
      // Refresh local checklistTask state from context
      const updatedTask = tasks.find((t) => t.id === checklistTask.id)
      if (updatedTask) {
        setChecklistTask({ ...updatedTask })
      }
      refreshData()
    } catch (err: any) {
      toast({
        title: isRu ? "Ошибка" : "Error",
        description: isRu ? "Не удалось переключить подзадачу" : "Failed to toggle subtask",
        variant: "destructive",
      })
    }
  }

  // Action: Add Subtask (Admin checklist)
  const handleAddSubtaskAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!checklistTask || !newSubtaskTitle.trim()) return
    setSubmittingSubtask(true)
    try {
      await addSubtask(checklistTask.id, newSubtaskTitle.trim())
      setNewSubtaskTitle("")
      // Refresh local checklistTask state from context
      const updatedTask = tasks.find((t) => t.id === checklistTask.id)
      if (updatedTask) {
        setChecklistTask({ ...updatedTask })
      }
      refreshData()
    } catch (err: any) {
      toast({
        title: isRu ? "Ошибка" : "Error",
        description: isRu ? "Не удалось добавить подзадачу" : "Failed to add subtask",
        variant: "destructive",
      })
    } finally {
      setSubmittingSubtask(false)
    }
  }

  // Action: Delete Subtask (Admin checklist)
  const handleDeleteSubtaskAdmin = async (subtaskId: string) => {
    if (!checklistTask) return
    try {
      await deleteSubtask(checklistTask.id, subtaskId)
      // Refresh local checklistTask state from context
      const updatedTask = tasks.find((t) => t.id === checklistTask.id)
      if (updatedTask) {
        setChecklistTask({ ...updatedTask })
      }
      refreshData()
    } catch (err: any) {
      toast({
        title: isRu ? "Ошибка" : "Error",
        description: isRu ? "Не удалось удалить подзадачу" : "Failed to delete subtask",
        variant: "destructive",
      })
    }
  }

  // Action: Inline Status Change
  const handleInlineStatusChange = async (taskId: string, status: any) => {
    try {
      await updateTask(taskId, { status })
      toast({
        title: isRu ? "Успешно" : "Success",
        description: isRu ? "Статус задачи обновлен!" : "Task status updated!",
      })
      refreshData()
    } catch (err: any) {
      toast({
        title: isRu ? "Ошибка" : "Error",
        description: isRu ? "Не удалось обновить статус" : "Failed to update status",
        variant: "destructive",
      })
    }
  }

  // Action: Inline Priority Change
  const handleInlinePriorityChange = async (taskId: string, priority: any) => {
    try {
      await updateTask(taskId, { priority })
      toast({
        title: isRu ? "Успешно" : "Success",
        description: isRu ? "Приоритет задачи обновлен!" : "Task priority updated!",
      })
      refreshData()
    } catch (err: any) {
      toast({
        title: isRu ? "Ошибка" : "Error",
        description: isRu ? "Не удалось обновить приоритет" : "Failed to update priority",
        variant: "destructive",
      })
    }
  }

  // Action: Inline Assignee Change
  const handleInlineAssigneeChange = async (taskId: string, assigneeId: string) => {
    try {
      await updateTask(taskId, { assigneeId: assigneeId || undefined })
      toast({
        title: isRu ? "Успешно" : "Success",
        description: isRu ? "Исполнитель задачи обновлен!" : "Task assignee updated!",
      })
      refreshData()
    } catch (err: any) {
      toast({
        title: isRu ? "Ошибка" : "Error",
        description: err.message || (isRu ? "Не удалось обновить исполнителя" : "Failed to update assignee"),
        variant: "destructive",
      })
    }
  }

  // Derived filter arrays
  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase()
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
  })

  const filteredProjects = adminProjects.filter((p) => {
    const q = projectSearch.toLowerCase()
    return p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
  })

  const filteredTasks = (tasks || []).filter((t) => {
    const q = taskSearch.toLowerCase()
    const matchesSearch = t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))
    const matchesProject = taskProjectFilter === "all" || t.projectId === taskProjectFilter
    const matchesStatus = taskStatusFilter === "all" || t.status === taskStatusFilter
    const matchesPriority = taskPriorityFilter === "all" || t.priority === taskPriorityFilter
    return matchesSearch && matchesProject && matchesStatus && matchesPriority
  })

  // Metrics calculations
  const totalUsersCount = users.length
  const adminCount = users.filter((u) => u.role.toUpperCase() === "ADMIN").length
  const regularUsersCount = totalUsersCount - adminCount
  const totalProjectsCount = adminProjects.length

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      {/* Header and short descriptions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Shield className="size-5 text-primary" />
            {t("adminPanel")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("adminPanelDesc")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "users" && (
            <Button
              onClick={() => setCreateOpen(true)}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 shadow-sm"
            >
              <UserPlus className="size-4" />
              {t("createUser")}
            </Button>
          )}
          {activeTab === "projects" && (
            <Button
              onClick={() => setProjectCreateOpen(true)}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 shadow-sm"
            >
              <FolderOpen className="size-4" />
              {isRu ? "Создать проект" : "Create Project"}
            </Button>
          )}
          {activeTab === "tasks" && (
            <Button
              onClick={() => {
                if (projects.length === 0) {
                  toast({
                    title: isRu ? "Ошибка" : "Error",
                    description: isRu ? "Создайте хотя бы один проект перед созданием задач." : "Create at least one project before creating tasks.",
                    variant: "destructive",
                  })
                  return
                }
                setNewTaskProject(projects[0].id)
                setNewTaskAssignee(teamMembers[0]?.id || "")
                setTaskCreateOpen(true)
              }}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 shadow-sm"
            >
              <PlusCircle className="size-4" />
              {isRu ? "Создать задачу" : "Create Task"}
            </Button>
          )}
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border bg-card shadow-sm relative overflow-hidden transition-all hover:scale-[1.01]">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("totalUsers")}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-3xl font-extrabold tracking-tight text-foreground">{totalUsersCount}</span>
            <Users className="size-5 text-primary/80 opacity-80" />
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm relative overflow-hidden transition-all hover:scale-[1.01]">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("adminUsers")}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-3xl font-extrabold tracking-tight text-foreground">{adminCount}</span>
            <ShieldCheck className="size-5 text-indigo-500 opacity-80" />
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm relative overflow-hidden transition-all hover:scale-[1.01]">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{isRu ? "Обычные пользователи" : "Regular Members"}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-3xl font-extrabold tracking-tight text-foreground">{regularUsersCount}</span>
            <Briefcase className="size-5 text-emerald-500 opacity-80" />
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm relative overflow-hidden transition-all hover:scale-[1.01]">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("activeProjects")}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-3xl font-extrabold tracking-tight text-foreground">{totalProjectsCount}</span>
            <FolderOpen className="size-5 text-amber-500 opacity-80" />
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
        <TabsList className="bg-muted/60 self-start border border-border/80 p-0.5 rounded-lg mb-4">
          <TabsTrigger value="users" className="gap-2 text-xs font-medium rounded-md px-4 py-1.5 cursor-pointer">
            <Users className="size-3.5" />
            {t("users")}
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-2 text-xs font-medium rounded-md px-4 py-1.5 cursor-pointer">
            <FolderOpen className="size-3.5" />
            {t("projects")}
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2 text-xs font-medium rounded-md px-4 py-1.5 cursor-pointer">
            <ListTodo className="size-3.5" />
            {isRu ? "Все задачи" : "Global Tasks"}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2 text-xs font-medium rounded-md px-4 py-1.5 cursor-pointer">
            <BarChart3 className="size-3.5" />
            {isRu ? "Аналитика системы" : "System Insights"}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Users Administration */}
        <TabsContent value="users" className="flex-1 flex flex-col gap-4 focus-visible:outline-none">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("searchUsers")}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9 bg-input/40 border-border focus:border-primary"
              />
            </div>
          </div>

          <Card className="border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
                    <th className="p-4">{t("name")}</th>
                    <th className="p-4">{t("email")}</th>
                    <th className="p-4">{t("role")}</th>
                    <th className="p-4 text-right">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredUsers.map((item) => {
                    const isSelf = item.id === currentUser?.id
                    const itemIsAdmin = item.role.toUpperCase() === "ADMIN"

                    return (
                      <tr key={item.id} className="hover:bg-accent/15 transition-colors group">
                        <td className="p-4 font-medium text-foreground">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8 border border-border/80">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold uppercase">
                                {item.avatar || item.name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-sm">
                              {item.name} {isSelf && <span className="text-[10px] text-primary/70 font-normal">({isRu ? "вы" : "you"})</span>}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{item.email}</td>
                        <td className="p-4">
                          <Badge
                            className={cn(
                              "text-[10px] font-semibold tracking-wide border-0 shadow-sm px-2 py-0.5",
                              itemIsAdmin
                                ? "bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20"
                                : "bg-slate-500/10 text-slate-500 dark:bg-slate-500/20"
                            )}
                          >
                            <Shield className="size-3 mr-1 shrink-0" />
                            {item.role.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isSelf}
                              onClick={() => handleToggleRole(item.id, item.role)}
                              className={cn(
                                "text-xs font-medium h-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all",
                                isSelf && "opacity-45 cursor-not-allowed"
                              )}
                            >
                              {itemIsAdmin
                                ? (isRu ? "Сделать USER" : "Make USER")
                                : (isRu ? "Сделать ADMIN" : "Make ADMIN")
                              }
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isSelf}
                              onClick={() => {
                                setSelectedNotifyUserId(item.id)
                                setNotifyDialogOpen(true)
                              }}
                              className={cn(
                                "size-8 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors shrink-0",
                                isSelf && "opacity-45 cursor-not-allowed"
                              )}
                            >
                              <Bell className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isSelf}
                              onClick={() => setDeleteUserTarget({ id: item.id, name: item.name })}
                              className={cn(
                                "size-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0",
                                isSelf && "opacity-45 cursor-not-allowed"
                              )}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">
                        {isRu ? "Пользователи не найдены" : "No users matched your query."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: Projects Administration */}
        <TabsContent value="projects" className="flex-1 flex flex-col gap-4 focus-visible:outline-none">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("searchProjects")}
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="pl-9 bg-input/40 border-border focus:border-primary"
              />
            </div>
          </div>

          <Card className="border-border bg-card overflow-hidden">
            {loadingProjects ? (
              <div className="flex flex-col items-center justify-center p-12 gap-3">
                <Loader2 className="size-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">{isRu ? "Загрузка проектов..." : "Loading projects..."}</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
                      <th className="p-4">{t("projects")}</th>
                      <th className="p-4">{isRu ? "Описание" : "Description"}</th>
                      <th className="p-4">{isRu ? "Прогресс задач" : "Task Progress"}</th>
                      <th className="p-4 text-right">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredProjects.map((p) => {
                      const percent = p.tasksCount > 0 ? Math.round((p.completedCount / p.tasksCount) * 100) : 0

                      return (
                        <tr
                          key={p.id}
                          onClick={() => handleOpenProjectManage(p)}
                          className="hover:bg-accent/15 cursor-pointer transition-colors group"
                        >
                          <td className="p-4 font-medium text-foreground">
                            <div className="flex items-center gap-3">
                              <span
                                className="size-3 rounded-full shrink-0 border shadow-sm"
                                style={{ backgroundColor: p.color }}
                              />
                              <span className="font-bold text-sm hover:underline">{p.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground max-w-[240px] truncate">
                            {p.description || (isRu ? "Без описания" : "No description")}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1 max-w-[160px]">
                              <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                                <span>{percent}%</span>
                                <span>{p.completedCount}/{p.tasksCount}</span>
                              </div>
                              <Progress value={percent} className="h-1.5 bg-muted" />
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenProjectManage(p)}
                                className="text-xs font-medium h-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                              >
                                {isRu ? "Управлять" : "Manage"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteProjectTarget({ id: p.id, name: p.name })}
                                className="size-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredProjects.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                          {isRu ? "Проекты не найдены" : "No projects matched your query."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tab 3: Global Tasks Administration */}
        <TabsContent value="tasks" className="flex-1 flex flex-col gap-4 focus-visible:outline-none">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={isRu ? "Поиск задач..." : "Search tasks..."}
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                className="pl-9 bg-input/40 border-border focus:border-primary"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={taskProjectFilter}
                onChange={(e) => setTaskProjectFilter(e.target.value)}
                className="rounded-md border border-border bg-input/40 px-3 py-1 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-9 cursor-pointer"
              >
                <option value="all">{isRu ? "Все проекты" : "All Projects"}</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <select
                value={taskStatusFilter}
                onChange={(e) => setTaskStatusFilter(e.target.value)}
                className="rounded-md border border-border bg-input/40 px-3 py-1 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-9 cursor-pointer"
              >
                <option value="all">{isRu ? "Все статусы" : "All Statuses"}</option>
                <option value="new">{isRu ? "Новая" : "New"}</option>
                <option value="in_progress">{isRu ? "В процессе" : "In Progress"}</option>
                <option value="review">{isRu ? "На ревью" : "Review"}</option>
                <option value="done">{isRu ? "Выполнено" : "Done"}</option>
                <option value="deferred">{isRu ? "Отложено" : "Deferred"}</option>
              </select>

              <select
                value={taskPriorityFilter}
                onChange={(e) => setTaskPriorityFilter(e.target.value)}
                className="rounded-md border border-border bg-input/40 px-3 py-1 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-9 cursor-pointer"
              >
                <option value="all">{isRu ? "Все приоритеты" : "All Priorities"}</option>
                <option value="urgent">{isRu ? "Ультра" : "Urgent"}</option>
                <option value="high">{isRu ? "Высокий" : "High"}</option>
                <option value="medium">{isRu ? "Средний" : "Medium"}</option>
                <option value="low">{isRu ? "Низкий" : "Low"}</option>
              </select>
            </div>
          </div>

          <Card className="border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
                    <th className="p-4">{isRu ? "Задача" : "Task"}</th>
                    <th className="p-4">{isRu ? "Проект" : "Project"}</th>
                    <th className="p-4">{isRu ? "Исполнитель" : "Assignee"}</th>
                    <th className="p-4">{isRu ? "Приоритет" : "Priority"}</th>
                    <th className="p-4">{isRu ? "Статус" : "Status"}</th>
                    <th className="p-4">{isRu ? "Подзадачи" : "Checklist"}</th>
                    <th className="p-4 text-right">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredTasks.map((t) => {
                    const project = projects.find((p) => p.id === t.projectId)
                    const assignee = users.find((u) => u.id === t.assigneeId)
                    const subtasks = t.subtasks || []
                    const completedSubtasks = subtasks.filter((s) => s.completed).length

                    // Filter users based on project's team with robust defaults
                    const team = teams.find((tm) => tm.teamId === project?.teamId) || teams.find((tm) => tm.teamId === "1") || teams[0]
                    const projectMembers = team
                      ? users.filter((u) => team.members.some((m) => m.userId === u.id) || u.id === t.assigneeId)
                      : users

                    return (
                      <tr key={t.id} className="hover:bg-accent/15 transition-colors group">
                        <td className="p-4 font-medium text-foreground">
                          <div className="flex flex-col gap-0.5 max-w-[200px]">
                            <span className="font-bold text-sm text-foreground truncate">{t.title}</span>
                            <span className="text-xs text-muted-foreground truncate">{t.description || (isRu ? "Без описания" : "No description")}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {project ? (
                            <div className="flex items-center gap-2">
                              <span
                                className="size-2.5 rounded-full shrink-0 border"
                                style={{ backgroundColor: project.color }}
                              />
                              <span className="text-xs font-medium truncate max-w-[120px]">{project.name}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">{isRu ? "Удален" : "Deleted"}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="size-6 border border-border/80 shrink-0">
                              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold uppercase">
                                {assignee?.avatar || assignee?.name.slice(0, 2) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <select
                              value={t.assigneeId || ""}
                              onChange={(e) => handleInlineAssigneeChange(t.id, e.target.value)}
                              className="text-xs font-semibold rounded-md border border-border/40 px-2 py-1 shadow-sm focus:ring-1 focus:ring-primary cursor-pointer bg-transparent text-muted-foreground w-[120px] focus:outline-none"
                            >
                              <option value="" className="text-foreground bg-card">{isRu ? "Не назначен" : "Unassigned"}</option>
                              {projectMembers.map((u) => (
                                <option key={u.id} value={u.id} className="text-foreground bg-card">
                                  {u.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="p-4">
                          <select
                            value={t.priority}
                            onChange={(e) => handleInlinePriorityChange(t.id, e.target.value)}
                            className={cn(
                              "text-xs font-semibold rounded-md border border-border/40 px-2 py-1 shadow-sm focus:ring-1 focus:ring-primary cursor-pointer w-fit bg-transparent",
                              t.priority === "urgent" && "text-rose-500 border-rose-500/30 bg-rose-500/5",
                              t.priority === "high" && "text-orange-500 border-orange-500/30 bg-orange-500/5",
                              t.priority === "medium" && "text-sky-500 border-sky-500/30 bg-sky-500/5",
                              t.priority === "low" && "text-slate-500 border-slate-500/30 bg-slate-500/5"
                            )}
                          >
                            <option value="urgent">Urgent</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <select
                            value={t.status}
                            onChange={(e) => handleInlineStatusChange(t.id, e.target.value)}
                            className={cn(
                              "text-xs font-semibold rounded-md border border-border/40 px-2 py-1 shadow-sm focus:ring-1 focus:ring-primary cursor-pointer w-fit bg-transparent",
                              t.status === "new" && "text-blue-500 border-blue-500/30 bg-blue-500/5",
                              t.status === "in_progress" && "text-amber-500 border-amber-500/30 bg-amber-500/5",
                              t.status === "review" && "text-indigo-500 border-indigo-500/30 bg-indigo-500/5",
                              t.status === "done" && "text-emerald-500 border-emerald-500/30 bg-emerald-500/5",
                              t.status === "deferred" && "text-slate-500 border-slate-500/30 bg-slate-500/5"
                            )}
                          >
                            <option value="new">New</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                            <option value="deferred">Deferred</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setChecklistTask(t)
                              setChecklistOpen(true)
                            }}
                            className="text-xs h-7 gap-1 px-2 hover:bg-primary/5 hover:text-primary transition-all border-border"
                          >
                            <CheckSquare className="size-3.5" />
                            <span>
                              {completedSubtasks}/{subtasks.length}
                            </span>
                          </Button>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTaskTarget({ id: t.id, title: t.title })}
                            className="size-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                  {filteredTasks.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        {isRu ? "Задачи не найдены" : "No tasks matched your search query."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 4: System Analytics & Insights */}
        <TabsContent value="analytics" className="flex-1 flex flex-col gap-6 focus-visible:outline-none">
          {(() => {
            const totalTasks = tasks.length
            const sCounts = {
              new: tasks.filter((t) => t.status === "new").length,
              in_progress: tasks.filter((t) => t.status === "in_progress").length,
              review: tasks.filter((t) => t.status === "review").length,
              done: tasks.filter((t) => t.status === "done").length,
              deferred: tasks.filter((t) => t.status === "deferred").length,
            }

            const pCounts = {
              urgent: tasks.filter((t) => t.priority === "urgent").length,
              high: tasks.filter((t) => t.priority === "high").length,
              medium: tasks.filter((t) => t.priority === "medium").length,
              low: tasks.filter((t) => t.priority === "low").length,
            }

            // Percentages helper
            const getPercent = (count: number) => {
              return totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0
            }

            const activeProjectsSorted = [...adminProjects]
              .sort((a, b) => b.tasksCount - a.tasksCount)
              .slice(0, 4)

            const maxPriorityCount = Math.max(pCounts.urgent, pCounts.high, pCounts.medium, pCounts.low, 1)

            // Circle SVG parameters
            const adminPercent = totalUsersCount > 0 ? Math.round((adminCount / totalUsersCount) * 100) : 0
            const strokeDash = 2 * Math.PI * 40 // circumference (radius = 40) => ~251.3

            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Task Status Distribution Card */}
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Layers className="size-4 text-primary" />
                      {isRu ? "Статусы задач в системе" : "Workspace Task Statuses"}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {isRu ? "Общее распределение задач по этапам выполнения." : "Overall distribution of tasks across execution workflows."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-5">
                    {/* Horizontal progress stack */}
                    <div className="h-4 w-full rounded-full overflow-hidden flex bg-muted">
                      {totalTasks === 0 ? (
                        <div className="w-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                          {isRu ? "Нет задач в системе" : "No tasks in workspace"}
                        </div>
                      ) : (
                        <>
                          {sCounts.new > 0 && <div className="h-full bg-blue-500" style={{ width: `${getPercent(sCounts.new)}%` }} title={`New: ${getPercent(sCounts.new)}%`} />}
                          {sCounts.in_progress > 0 && <div className="h-full bg-amber-500" style={{ width: `${getPercent(sCounts.in_progress)}%` }} title={`In Progress: ${getPercent(sCounts.in_progress)}%`} />}
                          {sCounts.review > 0 && <div className="h-full bg-indigo-500" style={{ width: `${getPercent(sCounts.review)}%` }} title={`Review: ${getPercent(sCounts.review)}%`} />}
                          {sCounts.done > 0 && <div className="h-full bg-emerald-500" style={{ width: `${getPercent(sCounts.done)}%` }} title={`Done: ${getPercent(sCounts.done)}%`} />}
                          {sCounts.deferred > 0 && <div className="h-full bg-slate-500" style={{ width: `${getPercent(sCounts.deferred)}%` }} title={`Deferred: ${getPercent(sCounts.deferred)}%`} />}
                        </>
                      )}
                    </div>

                    {/* Stats Legend */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-blue-500 shrink-0" />
                        <span className="font-semibold text-foreground">{isRu ? "Новые" : "New"}:</span>
                        <span className="text-muted-foreground ml-auto">{sCounts.new} ({getPercent(sCounts.new)}%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-amber-500 shrink-0" />
                        <span className="font-semibold text-foreground">{isRu ? "В работе" : "In Progress"}:</span>
                        <span className="text-muted-foreground ml-auto">{sCounts.in_progress} ({getPercent(sCounts.in_progress)}%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-indigo-500 shrink-0" />
                        <span className="font-semibold text-foreground">{isRu ? "На проверке" : "Review"}:</span>
                        <span className="text-muted-foreground ml-auto">{sCounts.review} ({getPercent(sCounts.review)}%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="font-semibold text-foreground">{isRu ? "Выполнены" : "Completed"}:</span>
                        <span className="text-muted-foreground ml-auto">{sCounts.done} ({getPercent(sCounts.done)}%)</span>
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                        <span className="size-2.5 rounded-full bg-slate-500 shrink-0" />
                        <span className="font-semibold text-foreground">{isRu ? "Отложены" : "Deferred"}:</span>
                        <span className="text-muted-foreground ml-auto">{sCounts.deferred} ({getPercent(sCounts.deferred)}%)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Task Priority breakdown Card */}
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Activity className="size-4 text-primary" />
                      {isRu ? "Приоритеты задач" : "Task Priorities"}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {isRu ? "Сравнение важности задач по приоритетам." : "Comparison of tasks sorted by key workspace priorities."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[180px] flex items-end justify-between px-6 pb-2">
                    {/* Urgent */}
                    <div className="flex flex-col items-center gap-2 w-12 group">
                      <div className="text-[10px] font-bold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">{pCounts.urgent}</div>
                      <div className="w-8 bg-red-500/20 group-hover:bg-red-500/30 rounded-t-md transition-all flex items-end overflow-hidden" style={{ height: `${(pCounts.urgent / maxPriorityCount) * 110}px` }}>
                        <div className="w-full bg-red-500 h-full origin-bottom scale-y-0 animate-in fade-in duration-500" style={{ transform: "scaleY(1)" }} />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">{isRu ? "Срочно" : "Urgent"}</span>
                    </div>

                    {/* High */}
                    <div className="flex flex-col items-center gap-2 w-12 group">
                      <div className="text-[10px] font-bold text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">{pCounts.high}</div>
                      <div className="w-8 bg-orange-500/20 group-hover:bg-orange-500/30 rounded-t-md transition-all flex items-end overflow-hidden" style={{ height: `${(pCounts.high / maxPriorityCount) * 110}px` }}>
                        <div className="w-full bg-orange-500 h-full origin-bottom scale-y-0 animate-in fade-in duration-500" style={{ transform: "scaleY(1)" }} />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">{isRu ? "Высокий" : "High"}</span>
                    </div>

                    {/* Medium */}
                    <div className="flex flex-col items-center gap-2 w-12 group">
                      <div className="text-[10px] font-bold text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity">{pCounts.medium}</div>
                      <div className="w-8 bg-yellow-500/20 group-hover:bg-yellow-500/30 rounded-t-md transition-all flex items-end overflow-hidden" style={{ height: `${(pCounts.medium / maxPriorityCount) * 110}px` }}>
                        <div className="w-full bg-yellow-500 h-full origin-bottom scale-y-0 animate-in fade-in duration-500" style={{ transform: "scaleY(1)" }} />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">{isRu ? "Средний" : "Medium"}</span>
                    </div>

                    {/* Low */}
                    <div className="flex flex-col items-center gap-2 w-12 group">
                      <div className="text-[10px] font-bold text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">{pCounts.low}</div>
                      <div className="w-8 bg-green-500/20 group-hover:bg-green-500/30 rounded-t-md transition-all flex items-end overflow-hidden" style={{ height: `${(pCounts.low / maxPriorityCount) * 110}px` }}>
                        <div className="w-full bg-green-500 h-full origin-bottom scale-y-0 animate-in fade-in duration-500" style={{ transform: "scaleY(1)" }} />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">{isRu ? "Низкий" : "Low"}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* 3. Role Ratio Circular Chart Card */}
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <PieChart className="size-4 text-indigo-500" />
                      {isRu ? "Соотношение ролей пользователей" : "Role Distribution Ratio"}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {isRu ? "Пропорция администраторов и обычных сотрудников." : "Proportion of administrators vs general workspace members."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-around gap-4 py-4">
                    {/* Ring SVG */}
                    <div className="relative size-24 flex items-center justify-center shrink-0">
                      <svg className="size-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="hsl(var(--muted))" strokeWidth="8" fill="transparent" />
                        <circle cx="48" cy="48" r="40" stroke="indigo" strokeWidth="8" fill="transparent" strokeDasharray={strokeDash} strokeDashoffset={strokeDash - (adminPercent / 100) * strokeDash} strokeLinecap="round" className="transition-all duration-1000" />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-lg font-extrabold text-foreground">{adminPercent}%</span>
                        <span className="text-[8px] uppercase tracking-wider text-muted-foreground">Admin</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5 text-xs flex-1">
                      <div className="flex items-center gap-2">
                        <span className="size-3 rounded-full bg-indigo-500 shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{isRu ? "Администраторы" : "Administrators"}</span>
                          <span className="text-[10px] text-muted-foreground">{adminCount} {isRu ? "пользователей" : "users"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="size-3 rounded-full bg-slate-400 dark:bg-slate-700 shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{isRu ? "Сотрудники" : "Workspace Members"}</span>
                          <span className="text-[10px] text-muted-foreground">{regularUsersCount} {isRu ? "пользователей" : "users"}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 4. Most Active Projects List Card */}
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <FolderOpen className="size-4 text-amber-500" />
                      {isRu ? "Самые активные проекты" : "Most Active Projects"}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {isRu ? "Топ проектов по количеству задач." : "Top corporate projects ordered by total tasks count."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-2">
                    {activeProjectsSorted.length === 0 ? (
                      <div className="text-center py-6 text-xs text-muted-foreground">
                        {isRu ? "Нет созданных проектов" : "No active projects found"}
                      </div>
                    ) : (
                      <div className="flex flex-col divide-y divide-border/60">
                        {activeProjectsSorted.map((p) => (
                          <div key={p.id} className="flex items-center justify-between py-2.5 text-xs group transition-colors">
                            <div className="flex items-center gap-2 font-medium">
                              <span className="size-2.5 rounded-full shrink-0 border" style={{ backgroundColor: p.color }} />
                              <span className="font-bold text-foreground truncate max-w-[150px]">{p.name}</span>
                            </div>
                            <div className="flex items-center gap-4 text-right">
                              <span className="font-medium text-muted-foreground">{p.tasksCount} {isRu ? "задач" : "tasks"}</span>
                              <Badge className="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-500 text-[10px] font-semibold border-0">
                                {p.completedCount} {isRu ? "выполнено" : "done"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>
            )
          })()}
        </TabsContent>
      </Tabs>

      {/* DIALOG: CREATE USER */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCheck className="size-5 text-primary" />
                {t("createUser")}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isRu
                  ? "Добавьте нового сотрудника в систему. Заполните имя, электронную почту и пароль."
                  : "Add a new employee to the workspace. Fill in name, email, and password."
                }
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-2">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="create-name" className="text-xs font-semibold text-muted-foreground">{t("name")}</Label>
                <div className="relative">
                  <Users className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/80" />
                  <Input
                    id="create-name"
                    type="text"
                    required
                    placeholder={isRu ? "Алексей Петров" : "John Doe"}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="pl-9 bg-input/40 border-border focus:border-primary"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="create-email" className="text-xs font-semibold text-muted-foreground">{t("email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/80" />
                  <Input
                    id="create-email"
                    type="email"
                    required
                    placeholder="alexey@taskflow.io"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="pl-9 bg-input/40 border-border focus:border-primary"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="create-password" className="text-xs font-semibold text-muted-foreground">{t("password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/80" />
                  <Input
                    id="create-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9 bg-input/40 border-border focus:border-primary"
                  />
                </div>
              </div>

              {/* Role */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="create-role" className="text-xs font-semibold text-muted-foreground">{t("role")}</Label>
                <select
                  id="create-role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as "USER" | "ADMIN")}
                  className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="USER">{isRu ? "USER (Сотрудник)" : "USER (Member)"}</option>
                  <option value="ADMIN">{isRu ? "ADMIN (Администратор)" : "ADMIN (Administrator)"}</option>
                </select>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={submittingUser}
                className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[90px]"
              >
                {submittingUser ? <Loader2 className="size-4 animate-spin" /> : t("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION: DELETE USER */}
      <Dialog open={deleteUserTarget !== null} onOpenChange={(open) => !open && setDeleteUserTarget(null)}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5 text-destructive" />
              {isRu ? "Удаление пользователя" : "Delete User"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {t("confirmDeleteUser")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <div className="rounded-md bg-muted/60 p-3 font-semibold text-foreground text-center">
              {deleteUserTarget?.name}
            </div>
            <div className="mt-2 text-xs text-muted-foreground/80 leading-normal text-muted-foreground">
              {isRu
                ? "Внимание: это действие необратимо. Пользователь потеряет доступ к системе."
                : "Warning: this action is permanent. The user will lose access to the system."
              }
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteUserTarget(null)}>
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION: DELETE PROJECT */}
      <Dialog open={deleteProjectTarget !== null} onOpenChange={(open) => !open && setDeleteProjectTarget(null)}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5 text-destructive" />
              {isRu ? "Удаление проекта" : "Delete Project"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {t("confirmDeleteProject")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <div className="rounded-md bg-muted/60 p-3 font-semibold text-foreground text-center">
              {deleteProjectTarget?.name}
            </div>
            <div className="mt-2 text-xs text-muted-foreground/80 leading-normal text-muted-foreground">
              {isRu
                ? "Внимание: все задачи, связанные с этим проектом, также будут окончательно удалены."
                : "Warning: all tasks associated with this project will also be permanently deleted."
              }
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteProjectTarget(null)}>
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ALL-IN-ONE PROJECT CONTROL CENTER */}
      <Dialog open={projectManageOpen} onOpenChange={setProjectManageOpen}>
        <DialogContent className="sm:max-w-3xl bg-card border-border overflow-hidden flex flex-col h-[85vh] max-h-[700px] p-0">
          <DialogHeader className="p-6 border-b border-border/60 pb-4 shrink-0">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <FolderOpen className="size-5 text-primary animate-pulse" />
              {isRu ? "Центр управления проектом" : "Project Control Center"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isRu 
                ? "Просмотр аналитики задач, редактирование метаданных и удаление проекта." 
                : "View task metrics, edit project details and perform bulk admin operations."
              }
            </DialogDescription>
          </DialogHeader>

          {selectedProject && (
            <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6 min-h-0">
              
              {/* Left Column: Metadata & Details Form */}
              <form onSubmit={handleUpdateProjectAdmin} className="w-full md:w-2/5 flex flex-col gap-4 border-r border-border/40 pr-0 md:pr-6 shrink-0">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ID проекта</span>
                  <span className="text-xs font-mono bg-muted/60 text-muted-foreground p-1.5 rounded border select-all">{selectedProject.id}</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {isRu ? "Название проекта" : "Project Name"} <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="text"
                    value={editProjectName}
                    onChange={(e) => setEditProjectName(e.target.value)}
                    required
                    className="bg-input/40 border-border"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {isRu ? "Описание проекта" : "Description"}
                  </label>
                  <textarea
                    value={editProjectDesc}
                    onChange={(e) => setEditProjectDesc(e.target.value)}
                    rows={4}
                    className="w-full rounded-md border border-border bg-input/40 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-foreground">{isRu ? "Цветовой маркер" : "Project Tag Color"}</label>
                  <div className="grid grid-cols-6 gap-2">
                    {["#4f8ff7", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f59e0b", "#f97316", "#10b981", "#14b8a6", "#06b6d4", "#64748b"].map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setEditProjectColor(c)}
                        className={cn(
                          "size-7 rounded-lg transition-all border border-black/5 dark:border-white/5",
                          editProjectColor === c ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" : "hover:scale-105"
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-4 flex flex-col gap-2">
                  <Button type="submit" disabled={savingProject || !editProjectName.trim()} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                    {savingProject ? (isRu ? "Сохранение..." : "Saving...") : (isRu ? "Сохранить изменения" : "Save Changes")}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      setDeleteProjectTarget({ id: selectedProject.id, name: selectedProject.name })
                      setProjectManageOpen(false)
                    }}
                    className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    {isRu ? "Удалить проект" : "Delete Project"}
                  </Button>
                </div>
              </form>

              {/* Right Column: Associated Tasks Registry list */}
              <div className="w-full md:w-3/5 flex flex-col gap-3 min-h-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ListTodo className="size-4 text-primary" />
                    {isRu ? "Задачи проекта" : "Project Tasks"}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {tasks.filter(t => t.projectId === selectedProject.id).length} {isRu ? "задач" : "tasks"}
                  </Badge>
                </div>

                <div className="flex-1 rounded-lg border border-border/80 bg-muted/10 overflow-y-auto p-2 flex flex-col gap-2 min-h-[200px]">
                  {(() => {
                    const projectTasks = tasks.filter(t => t.projectId === selectedProject.id)
                    if (projectTasks.length === 0) {
                      return (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-xs text-muted-foreground border border-dashed border-border/80 rounded-lg">
                          <ListTodo className="size-8 text-muted-foreground/45 mb-2" />
                          {isRu ? "В этом проекте еще нет созданных задач." : "No tasks belong to this project yet."}
                        </div>
                      )
                    }

                    return projectTasks.map((t) => {
                      const assignee = users.find((u) => u.id === t.assigneeId)
                      const subtasks = t.subtasks || []
                      const completedSubtasks = subtasks.filter((s) => s.completed).length

                      // Filter users based on project's team with robust defaults
                      const team = teams.find((tm) => tm.teamId === selectedProject.teamId) || teams.find((tm) => tm.teamId === "1") || teams[0]
                      const projectMembers = team
                        ? users.filter((u) => team.members.some((m) => m.userId === u.id) || u.id === t.assigneeId)
                        : users

                      return (
                        <div key={t.id} className="p-3 bg-card border border-border/60 hover:border-border/100 rounded-lg shadow-sm flex flex-col gap-2.5 transition-all">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-col gap-0.5 max-w-[70%]">
                              <span className="font-bold text-sm text-foreground truncate">{t.title}</span>
                              <span className="text-[10px] text-muted-foreground truncate">{t.description || (isRu ? "Без описания" : "No description")}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDeleteTaskTarget({ id: t.id, title: t.title })
                              }}
                              className="size-7 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/30">
                            {/* Assignee selection dropdown */}
                            <div className="flex items-center gap-1.5">
                              <Avatar className="size-5.5 border border-border/80 shrink-0">
                                <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-bold uppercase">
                                  {assignee?.avatar || assignee?.name.slice(0, 2) || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <select
                                value={t.assigneeId || ""}
                                onChange={(e) => handleInlineAssigneeChange(t.id, e.target.value)}
                                className="text-[10px] font-medium border border-border/40 rounded px-1 py-0.5 max-w-[100px] bg-transparent cursor-pointer text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                              >
                                <option value="" className="text-foreground bg-card">{isRu ? "Не назначен" : "Unassigned"}</option>
                                {projectMembers.map((u) => (
                                  <option key={u.id} value={u.id} className="text-foreground bg-card">
                                    {u.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Inner priority selector */}
                            <select
                              value={t.priority}
                              onChange={(e) => handleInlinePriorityChange(t.id, e.target.value)}
                              className={cn(
                                "text-[10px] font-bold rounded border border-border/40 px-1.5 py-0.5 cursor-pointer bg-transparent",
                                t.priority === "urgent" && "text-rose-500 border-rose-500/20 bg-rose-500/5",
                                t.priority === "high" && "text-orange-500 border-orange-500/20 bg-orange-500/5",
                                t.priority === "medium" && "text-sky-500 border-sky-500/20 bg-sky-500/5",
                                t.priority === "low" && "text-slate-500 border-slate-500/20 bg-slate-500/5"
                              )}
                            >
                              <option value="urgent">Urgent</option>
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>

                            {/* Inner status selector */}
                            <select
                              value={t.status}
                              onChange={(e) => handleInlineStatusChange(t.id, e.target.value)}
                              className={cn(
                                "text-[10px] font-bold rounded border border-border/40 px-1.5 py-0.5 cursor-pointer bg-transparent",
                                t.status === "new" && "text-blue-500 border-blue-500/20 bg-blue-500/5",
                                t.status === "in_progress" && "text-amber-500 border-amber-500/20 bg-amber-500/5",
                                t.status === "review" && "text-indigo-500 border-indigo-500/20 bg-indigo-500/5",
                                t.status === "done" && "text-emerald-500 border-emerald-500/20 bg-emerald-500/5",
                                t.status === "deferred" && "text-slate-500 border-slate-500/20 bg-slate-500/5"
                              )}
                            >
                              <option value="new">New</option>
                              <option value="in_progress">In Progress</option>
                              <option value="review">Review</option>
                              <option value="done">Done</option>
                              <option value="deferred">Deferred</option>
                            </select>

                            {/* Checklist dialog launch trigger */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setChecklistTask(t)
                                setChecklistOpen(true)
                              }}
                              className="text-[10px] h-6 gap-1 px-1.5 hover:bg-primary/5 hover:text-primary transition-all border-border/80"
                            >
                              <CheckSquare className="size-3" />
                              <span>{completedSubtasks}/{subtasks.length}</span>
                            </Button>
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>

            </div>
          )}

          <DialogFooter className="p-6 border-t border-border/60 bg-muted/30 shrink-0">
            <Button type="button" onClick={() => setProjectManageOpen(false)} className="bg-muted hover:bg-muted/80 text-muted-foreground w-full">
              {isRu ? "Закрыть" : "Close Control Center"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Project Dialog (Admin inline) */}
      <Dialog open={projectCreateOpen} onOpenChange={setProjectCreateOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="size-5 text-primary" />
              {isRu ? "Создать новый проект" : "Create New Project"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateProjectAdmin} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isRu ? "Название проекта" : "Project Name"} <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder={isRu ? "Введите название..." : "Project name..."}
                required
                className="bg-input/40 border-border"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isRu ? "Описание" : "Description"}
              </label>
              <textarea
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder={isRu ? "Опишите проект..." : "Description..."}
                rows={3}
                className="w-full rounded-md border border-border bg-input/40 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">{isRu ? "Цвет проекта" : "Project Color"}</label>
              <div className="flex flex-wrap gap-2">
                {["#4f8ff7", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f59e0b", "#f97316", "#10b981", "#14b8a6", "#06b6d4", "#64748b"].map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setNewProjectColor(c)}
                    className={cn(
                      "size-7 rounded-lg transition-all border border-black/5 dark:border-white/5",
                      newProjectColor === c ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" : "hover:scale-105"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => setProjectCreateOpen(false)} className="border-border">
                {isRu ? "Отмена" : "Cancel"}
              </Button>
              <Button type="submit" disabled={!newProjectName.trim() || submittingProject} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                {submittingProject ? (isRu ? "Создание..." : "Creating...") : (isRu ? "Создать проект" : "Create Project")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog (Admin inline) */}
      <Dialog open={taskCreateOpen} onOpenChange={setTaskCreateOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlusCircle className="size-5 text-primary" />
              {isRu ? "Создать глобальную задачу" : "Create Global Task"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTaskAdmin} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isRu ? "Название" : "Title"} <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder={isRu ? "Введите название задачи..." : "Task title..."}
                required
                className="bg-input/40 border-border"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">{isRu ? "Описание" : "Description"}</label>
              <textarea
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder={isRu ? "Опишите задачу..." : "Add a description..."}
                rows={3}
                className="w-full rounded-md border border-border bg-input/40 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">{isRu ? "Проект" : "Project"} <span className="text-destructive">*</span></label>
                <select
                  value={newTaskProject}
                  onChange={(e) => setNewTaskProject(e.target.value)}
                  className="rounded-md border border-border bg-input/40 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-10"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">{isRu ? "Исполнитель" : "Assignee"}</label>
                <select
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="rounded-md border border-border bg-input/40 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-10"
                >
                  <option value="">{isRu ? "Не назначен" : "Unassigned"}</option>
                  {(() => {
                    const project = projects.find((p) => p.id === newTaskProject)
                    const team = teams.find((tm) => tm.teamId === project?.teamId) || teams.find((tm) => tm.teamId === "1") || teams[0]
                    const projectMembers = team
                      ? users.filter((u) => team.members.some((m) => m.userId === u.id))
                      : users
                    return projectMembers.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))
                  })()}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">{isRu ? "Статус" : "Status"}</label>
                <select
                  value={newTaskStatus}
                  onChange={(e) => setNewTaskStatus(e.target.value as any)}
                  className="rounded-md border border-border bg-input/40 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-10"
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                  <option value="deferred">Deferred</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">{isRu ? "Приоритет" : "Priority"}</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="rounded-md border border-border bg-input/40 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">{isRu ? "Срок выполнения" : "Deadline"}</label>
              <Input
                type="date"
                value={newTaskDeadline}
                onChange={(e) => setNewTaskDeadline(e.target.value)}
                className="bg-input/40 border-border"
              />
            </div>

            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => setTaskCreateOpen(false)} className="border-border">
                {isRu ? "Отмена" : "Cancel"}
              </Button>
              <Button type="submit" disabled={!newTaskTitle.trim() || submittingTask} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                {submittingTask ? (isRu ? "Создание..." : "Creating...") : (isRu ? "Создать задачу" : "Create Task")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Checklist Management Dialog */}
      <Dialog open={checklistOpen} onOpenChange={setChecklistOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckSquare className="size-5 text-primary" />
              {isRu ? "Чек-лист задачи" : "Task Checklist"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2 max-h-[70vh] overflow-y-auto">
            {checklistTask && (
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 mb-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {isRu ? "Задача" : "Task"}
                </p>
                <p className="text-sm font-bold text-foreground leading-snug">{checklistTask.title}</p>
                {checklistTask.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{checklistTask.description}</p>
                )}
              </div>
            )}
            
            <form onSubmit={handleAddSubtaskAdmin} className="flex gap-2">
              <Input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder={isRu ? "Новая подзадача..." : "New checklist item..."}
                className="bg-input/40 border-border"
              />
              <Button type="submit" disabled={!newSubtaskTitle.trim() || submittingSubtask} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isRu ? "Добавить" : "Add"}
              </Button>
            </form>

            <div className="flex flex-col gap-2 mt-2">
              {checklistTask?.subtasks && checklistTask.subtasks.length > 0 ? (
                checklistTask.subtasks.map((s: any) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-border/40 bg-input/20 px-3 py-2 group hover:bg-accent/15 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleToggleSubtaskAdmin(s.id)}
                        className={cn(
                          "flex size-4.5 items-center justify-center rounded border border-border transition-all hover:border-primary/50",
                          s.completed ? "bg-primary border-primary text-primary-foreground" : "bg-transparent"
                        )}
                      >
                        {s.completed && <Check className="size-3 stroke-[3]" />}
                      </button>
                      <span
                        className={cn(
                          "text-sm font-medium transition-all",
                          s.completed ? "text-muted-foreground line-through" : "text-foreground"
                        )}
                      >
                        {s.title}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSubtaskAdmin(s.id)}
                      className="size-7 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                  {isRu ? "Нет подзадач в списке" : "No items in the checklist."}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setChecklistOpen(false)} className="bg-muted hover:bg-muted/80 text-muted-foreground w-full">
              {isRu ? "Закрыть" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Task Dialog */}
      <Dialog open={!!deleteTaskTarget} onOpenChange={(open) => !open && setDeleteTaskTarget(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              {isRu ? "Подтвердите удаление задачи" : "Confirm Task Deletion"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 text-sm text-muted-foreground leading-relaxed">
            {isRu ? (
              <>
                Вы уверены, что хотите окончательно удалить задачу <strong className="text-foreground">"{deleteTaskTarget?.title}"</strong>? Это действие необратимо.
              </>
            ) : (
              <>
                Are you absolutely sure you want to permanently delete task <strong className="text-foreground">"{deleteTaskTarget?.title}"</strong>? This action is irreversible.
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTaskTarget(null)} className="border-border">
              {isRu ? "Отмена" : "Cancel"}
            </Button>
            <Button variant="destructive" onClick={handleDeleteTaskAdmin}>
              {isRu ? "Удалить" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Send System Notification Dialog */}
      <SendNotificationDialog
        open={notifyDialogOpen}
        onOpenChange={setNotifyDialogOpen}
        initialUserId={selectedNotifyUserId}
      />
    </div>
  )
}
