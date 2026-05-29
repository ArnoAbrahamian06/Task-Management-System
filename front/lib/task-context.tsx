"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Task, Subtask, Project, User, Notification, AppSettings } from "./data"
import * as api from "./api"
import type { CreateTaskInput, CreateProjectInput } from "./api"
import { activityHistoryUtils } from "./activity-history"

interface TaskContextValue {
  // Data
  tasks: Task[]
  projects: Project[]
  users: User[]
  teamMembers: User[]
  teams: api.TeamWithMembers[]
  notifications: Notification[]
  settings: AppSettings | null
  loading: boolean

  // Task counts
  totalTasksCount: number
  completedTasksCount: number
  inProgressTasksCount: number
  overdueTasksCount: number

  // Task actions
  addTask: (input: CreateTaskInput) => Promise<Task>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  addComment: (taskId: string, text: string) => Promise<void>
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>
  addSubtask: (taskId: string, title: string) => Promise<Subtask>
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<Subtask>) => Promise<void>
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>

  // Project actions
  addProject: (input: CreateProjectInput) => Promise<Project>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>

  // Notification actions
  markNotificationRead: (id: string) => Promise<void>
  markAllNotificationsRead: () => Promise<void>
  clearAllNotifications: () => Promise<void>
  unreadNotificationsCount: number

  // Settings actions
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>

  // Admin actions
  adminCreateUser: (input: api.CreateUserInput) => Promise<User>
  adminChangeUserRole: (id: string, role: "USER" | "ADMIN") => Promise<User>
  adminDeleteUser: (id: string) => Promise<void>
  adminGetProjects: () => Promise<Project[]>
  adminDeleteProject: (id: string) => Promise<void>
  adminGetTasks: () => Promise<Task[]>
  adminDeleteTask: (id: string) => Promise<void>
  adminGetTeams: () => Promise<api.TeamWithMembers[]>

  // Auth
  user: User | null
  authenticated: boolean
  authLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void

  // Helpers
  getUserById: (id: string) => User | undefined
  getProjectById: (id: string) => Project | undefined
  isTeamLeadOfProject: (projectId: string) => boolean
  refreshData: () => Promise<void>

  // Invitations
  pendingInvitations: api.Invitation[]
  inviteUser: (teamId: string, email: string, position: string) => Promise<api.Invitation>
  acceptInvitation: (id: string) => Promise<void>
  declineInvitation: (id: string) => Promise<void>
  removeTeamMember: (teamId: string, userId: string) => Promise<void>
  t: (key: string) => string
}

const TaskContext = createContext<TaskContextValue | null>(null)

const translations: Record<string, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    kanban: "Kanban Board",
    list: "Task List",
    projects: "Projects",
    team: "Team",
    notifications: "Notifications",
    settings: "Settings",
    search: "Search...",
    theme: "Theme",
    language: "Language",
    profile: "Profile",
    workspace: "Workspace",
    integrations: "Integrations",
    navigation: "Navigation",
    profileSettings: "Profile Settings",
    saveChanges: "Save Changes",
    saving: "Saving...",
    fullName: "Full name",
    email: "Email",
    role: "Role",
    notificationPreferences: "Notification Preferences",
    appearance: "Appearance",
    changeAvatar: "Change avatar",
    adminPanel: "Admin Panel",
    admin_analytics: "Overview & Analytics",
    admin_users: "Users Directory",
    admin_projects: "Projects Registry",
    admin_tasks: "Global Tasks",
    admin_logs: "System Audit Logs",
    adminPanelDesc: "Manage system users, roles, projects and core metrics.",
    totalUsers: "Total Users",
    adminUsers: "Admin Users",
    activeProjects: "Active Projects",
    createUser: "Create User",
    delete: "Delete",
    name: "Name",
    password: "Password",
    actions: "Actions",
    save: "Save",
    cancel: "Cancel",
    searchUsers: "Search users...",
    searchProjects: "Search projects...",
    confirmDeleteUser: "Are you sure you want to delete this user?",
    confirmDeleteProject: "Are you sure you want to delete this project?",
    adminActions: "Administrative Actions",
    roleChangedSuccess: "Role changed successfully",
    userCreatedSuccess: "User created successfully",
    userDeletedSuccess: "User deleted successfully",
    projectDeletedSuccess: "Project deleted successfully",
  },
  ru: {
    dashboard: "Дашборд",
    kanban: "Канбан-доска",
    list: "Список задач",
    projects: "Проекты",
    team: "Команда",
    notifications: "Уведомления",
    settings: "Настройки",
    search: "Поиск...",
    theme: "Тема оформления",
    language: "Язык",
    profile: "Профиль",
    workspace: "Рабочая область",
    integrations: "Интеграции",
    navigation: "Навигация",
    profileSettings: "Настройки профиля",
    saveChanges: "Сохранить изменения",
    saving: "Сохранение...",
    fullName: "Полное имя",
    email: "Электронная почта",
    role: "Роль",
    notificationPreferences: "Настройки уведомлений",
    appearance: "Внешний вид",
    changeAvatar: "Изменить аватар",
    adminPanel: "Админ-панель",
    admin_analytics: "Аналитика системы",
    admin_users: "Список пользователей",
    admin_projects: "Реестр проектов",
    admin_tasks: "Глобальные задачи",
    admin_logs: "Журнал аудита",
    adminPanelDesc: "Управление пользователями системы, ролями, проектами и ключевыми метриками.",
    totalUsers: "Всего пользователей",
    adminUsers: "Администраторы",
    activeProjects: "Активные проекты",
    createUser: "Создать пользователя",
    delete: "Удалить",
    name: "Имя",
    password: "Пароль",
    actions: "Действия",
    save: "Сохранить",
    cancel: "Отмена",
    searchUsers: "Поиск пользователей...",
    searchProjects: "Поиск проектов...",
    confirmDeleteUser: "Вы уверены, что хотите удалить этого пользователя?",
    confirmDeleteProject: "Вы уверены, что хотите удалить этот проект?",
    adminActions: "Административные действия",
    roleChangedSuccess: "Роль успешно изменена",
    userCreatedSuccess: "Пользователь успешно создан",
    userDeletedSuccess: "Пользователь успешно удален",
    projectDeletedSuccess: "Проект успешно удален",
  }
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [teamMembers, setTeamMembers] = useState<User[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [teams, setTeams] = useState<api.TeamWithMembers[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<api.Invitation[]>([])

  // Task counts
  const [totalTasksCount, setTotalTasksCount] = useState(0)
  const [completedTasksCount, setCompletedTasksCount] = useState(0)
  const [inProgressTasksCount, setInProgressTasksCount] = useState(0)
  const [overdueTasksCount, setOverdueTasksCount] = useState(0)

  const loadData = useCallback(async () => {
    const isAdmin = Boolean(user?.role?.toLowerCase().includes("admin"))

    try {
      const [t, p, m, u, n, s, total, completed, inProgress, overdue, rawTeams, invs] = await Promise.all([
        isAdmin ? api.adminGetTasks() : api.getTasks(),
        isAdmin ? api.adminGetProjects() : api.getProjects(),
        api.getMyTeamMembers(),
        isAdmin ? api.getUsers() : Promise.resolve<User[]>([]),
        api.getNotifications(),
        api.getSettings(),
        api.getTotalTasksCount(),
        api.getCompletedTasksCount(),
        api.getInProgressTasksCount(),
        api.getOverdueTasksCount(),
        isAdmin ? api.adminGetTeams() : api.getMyTeamsWithMembers(),
        api.getMyPendingInvitations(),
      ])
      setTasks(t)
      setProjects(p)
      setUsers(isAdmin && u.length ? u : m)
      setTeamMembers(m)
      setNotifications(n)
      setSettings(s)
      setTotalTasksCount(total)
      setCompletedTasksCount(completed)
      setInProgressTasksCount(inProgress)
      setOverdueTasksCount(overdue)
      setTeams(rawTeams)
      setPendingInvitations(invs)
      console.log("Loaded data:", { tasks: t, projects: p, users: isAdmin && u.length ? u : m, teamMembers: m, teams: rawTeams, invitations: invs })
    } catch (err) {
      console.error("Failed to load data:", err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("taskflow_token") : null

    if (!token) {
      setAuthLoading(false)
      setLoading(false)
      return
    }

    void (async () => {
      try {
        const currentUser = await api.getCurrentUser()
        setUser(currentUser)
        setAuthenticated(true)
      } catch (err) {
        console.error("Failed to restore auth session:", err)
        api.logout()
        setLoading(false)
      } finally {
        setAuthLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (!authenticated) return

    setLoading(true)
    void loadData()
  }, [authenticated, loadData])

  const login = useCallback(async (email: string, password: string) => {
    setAuthLoading(true)
    try {
      const currentUser = await api.login(email, password)
      setUser(currentUser)
      setAuthenticated(true)
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const loadCounts = useCallback(async () => {
    try {
      const [total, completed, inProgress, overdue] = await Promise.all([
        api.getTotalTasksCount(),
        api.getCompletedTasksCount(),
        api.getInProgressTasksCount(),
        api.getOverdueTasksCount(),
      ])
      setTotalTasksCount(total)
      setCompletedTasksCount(completed)
      setInProgressTasksCount(inProgress)
      setOverdueTasksCount(overdue)
    } catch (err) {
      console.error("Failed to load counts:", err)
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    setAuthLoading(true)
    try {
      const currentUser = await api.register(name, email, password)
      setUser(currentUser)
      setAuthenticated(true)
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    api.logout()
    setAuthenticated(false)
    setUser(null)
    setTasks([])
    setProjects([])
    setUsers([])
    setNotifications([])
    setSettings(null)
    setLoading(false)
  }, [])

  // Task actions
  const addTask = useCallback(async (input: CreateTaskInput) => {
    const tempId = `temp-${Date.now()}`
    const tempTask: Task = {
      id: tempId,
      title: input.title,
      description: input.description ?? "",
      status: input.status ?? "new",
      priority: input.priority ?? "medium",
      assigneeId: input.assigneeId ?? user?.id ?? "u1",
      creatorId: user?.id ?? "u1",
      projectId: input.projectId ?? "p1",
      projectName: projects.find((p) => p.id === input.projectId)?.name ?? "",
      tags: input.tags ?? [],
      deadline: input.deadline ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      subtasks: [],
      timeEstimate: input.timeEstimate ?? 0,
      timeSpent: 0,
    }

    // 1. Optimistic prepend
    setTasks((prev) => [tempTask, ...prev])

    try {
      const realTask = await api.createTask(input)
      // 2. Replace temp task with real task
      setTasks((prev) => prev.map((t) => (t.id === tempId ? realTask : t)))
      
      // Refresh projects and counts
      const updatedProjects = await api.getProjects()
      setProjects(updatedProjects)
      await loadCounts()
      return realTask
    } catch (err) {
      console.error("addTask error:", err)
      // Rollback
      setTasks((prev) => prev.filter((t) => t.id !== tempId))
      throw err
    }
  }, [user, projects, loadCounts])

  const updateTaskAction = useCallback(async (id: string, updates: Partial<Task>) => {
    // Optimistic update
    setTasks((prev) => 
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    )

    try {
      const updated = await api.updateTask(id, updates)
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
      
      // Record activity
      if (user) {
        activityHistoryUtils.addActivity(updated, user.id, user.name)
      }
      
      if (updates.status) {
        const updatedProjects = await api.getProjects()
        setProjects(updatedProjects)
      }
      await loadCounts()
    } catch (err) {
      console.error("updateTaskAction error:", err)
      await loadData() // Rollback
    }
  }, [user, loadCounts, loadData])

  const deleteTaskAction = useCallback(async (id: string) => {
    // Optimistic delete
    setTasks((prev) => prev.filter((t) => t.id !== id))
    try {
      await api.deleteTask(id)
      const updatedProjects = await api.getProjects()
      setProjects(updatedProjects)
      await loadCounts()
    } catch (err) {
      console.error("deleteTaskAction error:", err)
      await loadData() // Rollback on failure
    }
  }, [loadCounts, loadData])

  const addCommentAction = useCallback(async (taskId: string, text: string) => {
    const updated = await api.addComment(taskId, "u1", text) // current user
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)))
  }, [])

  const toggleSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    if (subtaskId.startsWith("temp-")) {
      console.warn("Skipping toggle for temporary subtask:", subtaskId)
      return
    }

    // Optimistic update
    setTasks((prev) => 
      prev.map((t) => 
        t.id === taskId 
          ? { 
              ...t, 
              subtasks: t.subtasks.map(s => 
                s.id === subtaskId ? { ...s, done: !s.done } : s
              ) 
            } 
          : t
      )
    )

    try {
      const updatedSubtask = await api.toggleSubtask(taskId, subtaskId)
      setTasks((prev) => 
        prev.map((t) => 
          t.id === taskId 
            ? { 
                ...t, 
                subtasks: t.subtasks.map(s => 
                  s.id === subtaskId ? updatedSubtask : s
                ) 
              } 
            : t
        )
      )
    } catch (err) {
      console.error("toggleSubtask error:", err)
      await loadData() // Rollback/Sync
    }
  }, [loadData])

  const addSubtask = useCallback(async (taskId: string, title: string) => {
    const tempSubId = `temp-sub-${Date.now()}`
    const tempSubtask: Subtask = {
      id: tempSubId,
      title: title,
      done: false,
    }

    // 1. Optimistic append
    setTasks((prev) => 
      prev.map((t) => 
        t.id === taskId 
          ? { ...t, subtasks: [...t.subtasks, tempSubtask] } 
          : t
      )
    )

    try {
      const realSubtask = await api.addSubtask(taskId, title)
      // 2. Replace temp subtask with real subtask
      setTasks((prev) => 
        prev.map((t) => 
          t.id === taskId 
            ? { 
                ...t, 
                subtasks: t.subtasks.map((s) => s.id === tempSubId ? realSubtask : s) 
              } 
            : t
        )
      )
      return realSubtask
    } catch (err) {
      console.error("addSubtask error:", err)
      // Rollback
      setTasks((prev) => 
        prev.map((t) => 
          t.id === taskId 
            ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== tempSubId) } 
            : t
        )
      )
      throw err
    }
  }, [])

  const updateSubtask = useCallback(async (taskId: string, subtaskId: string, updates: { title?: string; completed?: boolean }) => {
    if (subtaskId.startsWith("temp-")) {
      console.warn("Skipping update for temporary subtask:", subtaskId)
      return
    }

    // Optimistic
    setTasks((prev) => 
      prev.map((t) => 
        t.id === taskId 
          ? { 
              ...t, 
              subtasks: t.subtasks.map(s => 
                s.id === subtaskId ? { ...s, title: updates.title ?? s.title, done: updates.completed ?? s.done } : s
              ) 
            } 
          : t
      )
    )

    try {
      const updated = await api.updateSubtask(subtaskId, updates)
      setTasks((prev) => 
        prev.map((t) => 
          t.id === taskId 
            ? { 
                ...t, 
                subtasks: t.subtasks.map(s => 
                  s.id === subtaskId ? updated : s
                ) 
              } 
            : t
        )
      )
    } catch (err) {
      console.error("updateSubtask error:", err)
      await loadData()
    }
  }, [loadData])

  const deleteSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    if (subtaskId.startsWith("temp-")) {
      console.warn("Skipping delete for temporary subtask:", subtaskId)
      return
    }

    // Optimistic delete
    setTasks((prev) => 
      prev.map((t) => 
        t.id === taskId 
          ? { ...t, subtasks: t.subtasks.filter(s => s.id !== subtaskId) } 
          : t
      )
    )

    try {
      await api.deleteSubtask(subtaskId)
    } catch (err) {
      console.error("deleteSubtask error:", err)
      await loadData() // Rollback/Sync
    }
  }, [loadData])

  // Project actions
  const addProject = useCallback(async (input: CreateProjectInput) => {
    const project = await api.createProject(input)
    setProjects((prev) => [...prev, project])
    return project
  }, [])

  const updateProjectAction = useCallback(async (id: string, updates: Partial<Project>) => {
    const updated = await api.updateProject(id, updates)
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)))
  }, [])

  const deleteProjectAction = useCallback(async (id: string) => {
    // Optimistic delete
    setProjects((prev) => prev.filter((p) => p.id !== id))
    try {
      await api.deleteProject(id)
    } catch (err) {
      console.error("deleteProjectAction error:", err)
      await loadData() // Rollback on failure
    }
  }, [loadData])

  // Notification actions
  const markNotificationReadAction = useCallback(async (id: string) => {
    const updated = await api.markNotificationRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)))
  }, [])

  const markAllNotificationsReadAction = useCallback(async () => {
    await api.markAllNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const clearAllNotificationsAction = useCallback(async () => {
    await api.clearAllNotifications()
    setNotifications([])
  }, [])

  // Settings actions
  const updateSettingsAction = useCallback(async (updates: Partial<AppSettings>) => {
    const updated = await api.updateSettings(updates)
    setSettings(updated)
  }, [])

  // Helpers
  const getUserById = useCallback((id: string) => users.find((u) => u.id === id), [users])
  const getProjectById = useCallback((id: string) => projects.find((p) => p.id === id), [projects])
  
  const isTeamLeadOfProject = useCallback((projectId: string): boolean => {
    if (!user) return false
    const project = projects.find((p) => p.id === projectId)
    if (!project || !project.teamId) return false
    const team = teams.find((t) => t.teamId === project.teamId)
    if (!team) return false
    const member = team.members.find((m) => m.userId === user.id)
    return member?.role === "TEAM_LEAD"
  }, [projects, teams, user])

  const inviteUser = useCallback(async (teamId: string, email: string, position: string) => {
    const inv = await api.inviteUser(teamId, email, position)
    return inv
  }, [])

  const acceptInvitation = useCallback(async (id: string) => {
    setPendingInvitations((prev) => prev.filter((inv) => inv.id !== id))
    try {
      await api.acceptInvitation(id)
      await loadData()
    } catch (err) {
      console.error("acceptInvitation error:", err)
      await loadData()
    }
  }, [loadData])

  const declineInvitation = useCallback(async (id: string) => {
    setPendingInvitations((prev) => prev.filter((inv) => inv.id !== id))
    try {
      await api.declineInvitation(id)
    } catch (err) {
      console.error("declineInvitation error:", err)
      await loadData()
    }
  }, [loadData])

  const removeTeamMember = useCallback(async (teamId: string, userId: string) => {
    try {
      await api.removeTeamMember(teamId, userId)
      await loadData()
    } catch (err) {
      console.error("removeTeamMember error:", err)
      throw err
    }
  }, [loadData])

  const adminCreateUser = useCallback(async (input: api.CreateUserInput) => {
    const newUser = await api.adminCreateUser(input)
    await loadData()
    return newUser
  }, [loadData])

  const adminChangeUserRole = useCallback(async (id: string, role: "USER" | "ADMIN") => {
    const updatedUser = await api.adminChangeUserRole(id, role)
    await loadData()
    return updatedUser
  }, [loadData])

  const adminDeleteUser = useCallback(async (id: string) => {
    await api.adminDeleteUser(id)
    await loadData()
  }, [loadData])

  const adminGetProjects = useCallback(async () => {
    return api.adminGetProjects()
  }, [])

  const adminDeleteProject = useCallback(async (id: string) => {
    await api.adminDeleteProject(id)
    await loadData()
  }, [loadData])

  const adminGetTasks = useCallback(async () => {
    return api.adminGetTasks()
  }, [])

  const adminDeleteTask = useCallback(async (id: string) => {
    await api.adminDeleteTask(id)
    await loadData()
  }, [loadData])

  const adminGetTeams = useCallback(async () => {
    return api.adminGetTeams()
  }, [])

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length

  const t = useCallback((key: string): string => {
    const lang = settings?.appearance.language || "en"
    const dict = translations[lang] || translations.en
    return dict[key] || translations.en[key] || key
  }, [settings?.appearance.language])

  const value: TaskContextValue = {
    tasks,
    projects,
    users,
    teamMembers,
    teams,
    notifications,
    settings,
    loading,
    totalTasksCount,
    completedTasksCount,
    inProgressTasksCount,
    overdueTasksCount,
    addTask,
    updateTask: updateTaskAction,
    deleteTask: deleteTaskAction,
    addComment: addCommentAction,
    toggleSubtask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    addProject,
    updateProject: updateProjectAction,
    deleteProject: deleteProjectAction,
    markNotificationRead: markNotificationReadAction,
    markAllNotificationsRead: markAllNotificationsReadAction,
    clearAllNotifications: clearAllNotificationsAction,
    unreadNotificationsCount,
    updateSettings: updateSettingsAction,
    user,
    authenticated,
    authLoading,
    login,
    register,
    logout,
    getUserById,
    getProjectById,
    isTeamLeadOfProject,
    refreshData: loadData,
    pendingInvitations,
    inviteUser,
    acceptInvitation,
    declineInvitation,
    removeTeamMember,
    t,
    adminCreateUser,
    adminChangeUserRole,
    adminDeleteUser,
    adminGetProjects,
    adminDeleteProject,
    adminGetTasks,
    adminDeleteTask,
    adminGetTeams,
  }

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export function useTaskContext() {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error("useTaskContext must be used within TaskProvider")
  return ctx
}
