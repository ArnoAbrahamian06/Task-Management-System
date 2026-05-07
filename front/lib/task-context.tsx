"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Task, Project, User, Notification, AppSettings } from "./data"
import * as api from "./api"
import type { CreateTaskInput, CreateProjectInput } from "./api"

interface TaskContextValue {
  // Data
  tasks: Task[]
  projects: Project[]
  users: User[]
  teamMembers: User[]
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
  refreshData: () => Promise<void>
}

const TaskContext = createContext<TaskContextValue | null>(null)

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

  // Task counts
  const [totalTasksCount, setTotalTasksCount] = useState(0)
  const [completedTasksCount, setCompletedTasksCount] = useState(0)
  const [inProgressTasksCount, setInProgressTasksCount] = useState(0)
  const [overdueTasksCount, setOverdueTasksCount] = useState(0)

  const loadData = useCallback(async () => {
    try {
      const [t, p, u, m, n, s, total, completed, inProgress, overdue] = await Promise.all([
        api.getTasks(),
        api.getProjects(),
        api.getUsers(),
        api.getMyTeamMembers(),
        api.getNotifications(),
        api.getSettings(),
        api.getTotalTasksCount(),
        api.getCompletedTasksCount(),
        api.getInProgressTasksCount(),
        api.getOverdueTasksCount(),
      ])
      setTasks(t)
      setProjects(p)
      setUsers(u.length ? u : m)
      setTeamMembers(m)
      setNotifications(n)
      setSettings(s)
      setTotalTasksCount(total)
      setCompletedTasksCount(completed)
      setInProgressTasksCount(inProgress)
      setOverdueTasksCount(overdue)
    } catch (err) {
      console.error("Failed to load data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

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
    const task = await api.createTask(input)
    setTasks((prev) => [task, ...prev])
    // Refresh projects and counts
    const updatedProjects = await api.getProjects()
    setProjects(updatedProjects)
    await loadCounts()
    return task
  }, [loadCounts])

  const updateTaskAction = useCallback(async (id: string, updates: Partial<Task>) => {
    const updated = await api.updateTask(id, updates)
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
    if (updates.status) {
      const updatedProjects = await api.getProjects()
      setProjects(updatedProjects)
    }
    await loadCounts()
  }, [loadCounts])

  const deleteTaskAction = useCallback(async (id: string) => {
    await api.deleteTask(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
    const updatedProjects = await api.getProjects()
    setProjects(updatedProjects)
    await loadCounts()
  }, [loadCounts])

  const addCommentAction = useCallback(async (taskId: string, text: string) => {
    const updated = await api.addComment(taskId, "u1", text) // current user
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)))
  }, [])

  const toggleSubtaskAction = useCallback(async (taskId: string, subtaskId: string) => {
    const updated = await api.toggleSubtask(taskId, subtaskId)
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)))
  }, [])

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
    await api.deleteProject(id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }, [])

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
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length

  const value: TaskContextValue = {
    tasks,
    projects,
    users,
    teamMembers,
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
    toggleSubtask: toggleSubtaskAction,
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
    refreshData: loadData,
  }

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export function useTaskContext() {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error("useTaskContext must be used within TaskProvider")
  return ctx
}
