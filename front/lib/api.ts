/**
 * ============================================================
 * TaskFlow API Service
 * ============================================================
 *
 * This module provides a centralized API layer for all data operations.
 * Currently it uses mock data from lib/data.ts, but every function returns
 * a Promise so you can easily swap it for real fetch() calls.
 *
 * HOW TO CONNECT YOUR REAL BACKEND:
 * ---------------------------------
 * 1. Set your API base URL below (API_BASE_URL)
 * 2. Replace the body of each function with a fetch() call. Example:
 *
 *    // Before (mock):
 *    export async function getTasks(): Promise<Task[]> {
 *      await delay(100)
 *      return [...mockTasks]
 *    }
 *
 *    // After (real API):
 *    export async function getTasks(): Promise<Task[]> {
 *      const res = await fetch(`${API_BASE_URL}/tasks`, {
 *        headers: getHeaders(),
 *      })
 *      if (!res.ok) throw new Error('Failed to fetch tasks')
 *      return res.json()
 *    }
 *
 * 3. If you need auth tokens, add them in getHeaders():
 *    function getHeaders() {
 *      return {
 *        'Content-Type': 'application/json',
 *        'Authorization': `Bearer ${getToken()}`,
 *      }
 *    }
 *
 * That's it! The rest of the app uses these functions via the
 * TaskContext (lib/task-context.tsx) and will work without any changes.
 * ============================================================
 */

import {
  type Task,
  type Subtask,
  type Project,
  type User,
  type Notification,
  type AppSettings,
  type Priority,
  type Status,
  tasks as mockTasks,
  projects as mockProjects,
  users as mockUsers,
  notifications as mockNotifications,
  defaultSettings as mockSettings,
} from "./data"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
const DEFAULT_TEAM_ID = Number(process.env.NEXT_PUBLIC_DEFAULT_TEAM_ID ?? 1)

type ApiTaskStatus = "NEW" | "IN_PROGRESS" | "REVIEW" | "DONE" | "DEFERRED"
type ApiTaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"

interface ApiTaskResponse {
  id: string | number
  title: string
  description?: string
  status: ApiTaskStatus
  priority: ApiTaskPriority
  deadline?: string
  project: { id: string | number; name: string }
  assignee: { id: string | number; name?: string; email?: string }
  creator?: { id: string | number; name?: string; email?: string } | null
  createdAt: string
  updatedAt: string
  subtasks?: ApiSubtaskResponse[]
}

interface ApiProjectResponse {
  id: string | number
  name: string
  description?: string
  teamId?: string | number
  teamName?: string
  tasksCount?: number
  completedCount?: number
  createdAt?: string
  updatedAt?: string
}

interface ApiUserResponse {
  id: string | number
  name: string
  email: string
  role: string
}

interface ApiMemberDetailsResponse {
  userId: string | number
  userName?: string
  email?: string
  position?: string
}

interface ApiTeamWithMembersResponse {
  teamId: string | number
  teamName: string
  members: ApiMemberDetailsResponse[]
}

interface ApiSubtaskResponse {
  id: string | number
  title?: string
  completed: boolean
}

function delay(ms = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeId(value: string | number): string {
  return String(value)
}

function formatToLocalDateTime(dateStr?: string) {
  if (!dateStr) return undefined
  if (dateStr.includes("T")) {
    // Strip milliseconds and Z if present
    return dateStr.split(".")[0].replace("Z", "")
  }
  // Handle YYYY-MM-DD
  return `${dateStr}T00:00:00`
}

function toAvatar(name: string): string {
  if (!name) return "U"
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const apiStatusToStatus: Record<ApiTaskStatus, Status> = {
  NEW: "new",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  DONE: "done",
  DEFERRED: "deferred",
}

const statusToApiStatus: Record<Status, ApiTaskStatus> = {
  new: "NEW",
  in_progress: "IN_PROGRESS",
  review: "REVIEW",
  done: "DONE",
  deferred: "DEFERRED",
}

const apiPriorityToPriority: Record<ApiTaskPriority, Priority> = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
}

const priorityToApiPriority: Record<Priority, ApiTaskPriority> = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
  urgent: "URGENT",
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("taskflow_token")
}

function setAuthToken(token: string) {
  if (typeof window === "undefined") return
  localStorage.setItem("taskflow_token", token)
}

function clearAuthToken() {
  if (typeof window === "undefined") return
  localStorage.removeItem("taskflow_token")
}

function getHeaders(hasBody = false, skipAuth = false): Record<string, string> {
  const token = getAuthToken()
  return {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(!skipAuth && token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit, skipAuth = false): Promise<T> {
  const hasBody = init?.body !== undefined
  let response: Response

  try {
    response = await fetch(input, {
      ...init,
      headers: {
        ...getHeaders(hasBody, skipAuth),
        ...(init?.headers ?? {}),
      },
    })
  } catch (err) {
    throw new Error(
      `Network request failed: ${err instanceof Error ? err.message : String(err)}`
    )
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "")
    let errorMessage = `Request failed (${response.status} ${response.statusText})${text ? `: ${text}` : ""}`
    try {
      if (text) {
        const parsed = JSON.parse(text)
        if (parsed && typeof parsed.message === "string") {
          errorMessage = parsed.message
        }
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage)
  }

  // Check if response has content
  const contentLength = response.headers.get('content-length')
  const contentType = response.headers.get('content-type')

  if (contentLength === '0' || !contentType?.includes('application/json')) {
    // Return empty object for responses without JSON content
    return {} as T
  }

  try {
    return await response.json()
  } catch (err) {
    console.warn(`Failed to parse JSON response from ${input}:`, err)
    // Return empty object as fallback
    return {} as T
  }
}

async function fetchToken(input: RequestInfo, init?: RequestInit, skipAuth = false): Promise<string> {
  const hasBody = init?.body !== undefined
  let response: Response

  try {
    response = await fetch(input, {
      ...init,
      headers: {
        ...getHeaders(hasBody, skipAuth),
        ...(init?.headers ?? {}),
      },
    })
  } catch (err) {
    throw new Error(
      `Network request failed: ${err instanceof Error ? err.message : String(err)}`
    )
  }

  const text = await response.text().catch(() => "")

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status} ${response.statusText})${text ? `: ${text}` : ""}`
    try {
      if (text) {
        const parsed = JSON.parse(text)
        if (parsed && typeof parsed.message === "string") {
          errorMessage = parsed.message
        }
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage)
  }

  try {
    const parsed = JSON.parse(text)
    if (typeof parsed === "string") return parsed
    if (parsed && typeof parsed === "object") {
      if (typeof (parsed as Record<string, unknown>).token === "string") {
        return (parsed as Record<string, string>).token
      }
      if (typeof (parsed as Record<string, unknown>).accessToken === "string") {
        return (parsed as Record<string, string>).accessToken
      }
    }
  } catch {
    // ignore invalid JSON and fallback to raw text
  }

  return text.trim()
}

export async function getCurrentUser(): Promise<User> {
  try {
    const data = await fetchJson<ApiUserResponse>(`${API_BASE_URL}/api/users/me`)
    return {
      id: normalizeId(data.id),
      name: data.name,
      avatar: toAvatar(data.name),
      role: data.role,
      email: data.email,
    }
  } catch (err) {
    if (err instanceof Error && /(401|403)/.test(err.message)) {
      logout()
    }
    throw err
  }
}

export async function login(email: string, password: string): Promise<User> {
  const token = await fetchToken(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }, true)

  setAuthToken(token)
  return getCurrentUser()
}

export async function register(name: string, email: string, password: string): Promise<User> {
  await fetchJson<ApiUserResponse>(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  }, true)

  return login(email, password)
}

export function logout(): void {
  clearAuthToken()
}

function mapApiTask(task: ApiTaskResponse): Task {
  const mapped = {
    id: normalizeId(task.id),
    title: task.title,
    description: task.description ?? "",
    status: apiStatusToStatus[task.status] ?? "new",
    priority: apiPriorityToPriority[task.priority] ?? "medium",
    assigneeId: normalizeId(task.assignee?.id ?? "u1"),
    creatorId: task.creator ? normalizeId(task.creator.id) : normalizeId(task.assignee?.id ?? "u1"),
    projectId: normalizeId(task.project?.id ?? "p1"),
    projectName: task.project?.name ?? "",
    tags: [],
    deadline:
      task.deadline?.split("T")[0] ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    comments: [],
    subtasks: (task.subtasks ?? []).map((s) => ({
      id: normalizeId(s.id),
      title: s.title ?? "",
      done: s.completed,
    })),
    timeEstimate: 0,
    timeSpent: 0,
  }
  console.log("Mapped task:", mapped)
  return mapped
}

function getProjectColor(projectId: string, defaultColor = "#4f8ff7"): string {
  if (typeof window === "undefined") return defaultColor
  const saved = localStorage.getItem(`project_color_${projectId}`)
  if (saved) return saved
  localStorage.setItem(`project_color_${projectId}`, defaultColor)
  return defaultColor
}

function saveProjectColor(projectId: string, color: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(`project_color_${projectId}`, color)
}

function mapApiProject(project: ApiProjectResponse, color?: string): Project {
  const id = normalizeId(project.id)
  const resolvedColor = color ? (saveProjectColor(id, color), color) : getProjectColor(id)
  return {
    id,
    name: project.name,
    color: resolvedColor,
    description: project.description ?? "",
    tasksCount: project.tasksCount ?? 0,
    completedCount: project.completedCount ?? 0,
    teamId: project.teamId ? normalizeId(project.teamId) : undefined,
  }
}

function mapApiUser(user: ApiUserResponse): User {
  const name = user.name || user.email || "Unknown User"
  return {
    id: normalizeId(user.id),
    name,
    avatar: toAvatar(name),
    role: user.role,
    email: user.email,
  }
}

// ---- Internal mutable state (simulates database) ----
let _tasks: Task[] = []
let _projects: Project[] = []
let _notifications: Notification[] = []
let _settings = {
  profile: { name: "", email: "", avatar: "", role: "" },
  notifications: {
    emailTaskAssigned: true,
    emailComments: true,
    emailDeadlines: true,
    pushTaskAssigned: true,
    pushComments: false,
    pushDeadlines: true,
    inAppTaskAssigned: true,
    inAppComments: true,
    inAppDeadlines: true,
  },
  appearance: { language: "en", theme: "dark", showCompletedTasks: true, sidebarStyle: "dark" as const },
  workspace: { name: "Team Workspace", defaultProjectId: "" },
}
let _nextId = 100

function genId(prefix: string) {
  _nextId++
  return `${prefix}${_nextId}`
}

// ==========================
// TASKS
// ==========================

function syncTasks(data: Task | Task[]) {
  const newTasks = Array.isArray(data) ? data : [data]
  newTasks.forEach((newTask) => {
    const idx = _tasks.findIndex((t) => t.id === newTask.id)
    if (idx !== -1) {
      _tasks[idx] = { ..._tasks[idx], ...newTask }
    } else {
      _tasks.push(newTask)
    }
  })
}

export async function getTasks(): Promise<Task[]> {
  try {
    const data = await fetchJson<ApiTaskResponse[]>(`${API_BASE_URL}/api/tasks/my`)
    const mapped = data.map(mapApiTask)
    syncTasks(mapped)
    return mapped
  } catch (err) {
    console.warn("Failed to load tasks from API.", err)
    return _tasks
  }
}

export async function getTopPriorityTasks(): Promise<Task[]> {
  try {
    const data = await fetchJson<ApiTaskResponse[]>(
      `${API_BASE_URL}/api/tasks/my/top-priority`
    )
    const mapped = data.map(mapApiTask)
    syncTasks(mapped)
    return mapped
  } catch (err) {
    console.warn("Failed to load top priority tasks from API.", err)
    return _tasks
      .filter((t) => t.status !== "done" && (t.priority === "urgent" || t.priority === "high"))
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 5)
  }
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  const local = _tasks.find((t) => t.id === id)
  if (local) return local

  try {
    const result = await fetchJson<ApiTaskResponse>(`${API_BASE_URL}/api/tasks/${id}`)
    const task = mapApiTask(result)
    syncTasks(task)
    return task
  } catch (err) {
    console.warn(`Failed to fetch task ${id} from API`, err)
    return undefined
  }
}

export interface CreateTaskInput {
  title: string
  description?: string
  status?: Status
  priority?: Priority
  assigneeId?: string
  creatorId?: string
  projectId?: string
  tags?: string[]
  deadline?: string
  timeEstimate?: number
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const payload = {
    title: input.title,
    description: input.description,
    priority: priorityToApiPriority[input.priority ?? "medium"],
    projectId: Number(input.projectId),
    deadline: formatToLocalDateTime(input.deadline),
    assigneeId: input.assigneeId ? Number(input.assigneeId) : undefined,
  }

  if (!payload.projectId) {
    throw new Error("Project ID is required to create a task")
  }

  console.log("Creating task with payload:", payload)

  const result = await fetchJson<ApiTaskResponse>(`${API_BASE_URL}/api/tasks`, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  if (!result || !result.id) {
    throw new Error("Invalid API response during task creation")
  }

  return mapApiTask(result)
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const payload: Record<string, unknown> = {}

  if (updates.title !== undefined) payload.title = updates.title
  if (updates.description !== undefined) payload.description = updates.description
  if (updates.status !== undefined) payload.status = statusToApiStatus[updates.status]
  if (updates.priority !== undefined) payload.priority = priorityToApiPriority[updates.priority]
  if (updates.deadline !== undefined) payload.deadline = formatToLocalDateTime(updates.deadline)
  if (updates.assigneeId !== undefined) payload.assigneeId = Number(updates.assigneeId)

  try {
    const result = await fetchJson<ApiTaskResponse>(`${API_BASE_URL}/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
    const updated = mapApiTask(result)
    _tasks = _tasks.map((t) => (t.id === id ? updated : t))
    return updated
  } catch (err) {
    console.warn("Failed to update task through API, using local fallback.", err)
    const idx = _tasks.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error(`Task ${id} not found`)

    const old = _tasks[idx]
    const updated: Task = {
      ...old,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    _tasks[idx] = updated

    if (updates.status && updates.status !== old.status) {
      const proj = _projects.find((p) => p.id === updated.projectId)
      if (proj) {
        if (updates.status === "done" && old.status !== "done") proj.completedCount++
        if (updates.status !== "done" && old.status === "done") proj.completedCount--
      }
    }

    return updated
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    await fetchJson(`${API_BASE_URL}/api/tasks/${id}`, { method: "DELETE" })
    _tasks = _tasks.filter((t) => t.id !== id)
  } catch (err) {
    console.warn("Failed to delete task through API, using local fallback.", err)
    const task = _tasks.find((t) => t.id === id)
    if (task) {
      const proj = _projects.find((p) => p.id === task.projectId)
      if (proj) {
        proj.tasksCount--
        if (task.status === "done") proj.completedCount--
      }
    }
    _tasks = _tasks.filter((t) => t.id !== id)
  }
}

export async function addComment(taskId: string, userId: string, text: string): Promise<Task> {
  await delay(100)
  const idx = _tasks.findIndex((t) => t.id === taskId)
  if (idx === -1) throw new Error(`Task ${taskId} not found`)
  const comment = { id: genId("c"), userId, text, createdAt: new Date().toISOString() }
  _tasks[idx] = {
    ..._tasks[idx],
    comments: [..._tasks[idx].comments, comment],
    updatedAt: new Date().toISOString(),
  }
  return _tasks[idx]
}

export async function toggleSubtask(taskId: string, subtaskId: string): Promise<Subtask> {
  const result = await fetchJson<ApiSubtaskResponse>(
    `${API_BASE_URL}/api/subtasks/${subtaskId}/toggle`,
    { method: "PATCH" }
  )
  return {
    id: normalizeId(result.id),
    title: result.title ?? "",
    done: result.completed,
  }
}

export async function addSubtask(taskId: string, title: string): Promise<Subtask> {
  const result = await fetchJson<ApiSubtaskResponse>(
    `${API_BASE_URL}/api/tasks/${taskId}/subtasks`,
    {
      method: "POST",
      body: JSON.stringify({ title }),
    }
  )
  return {
    id: normalizeId(result.id),
    title: result.title ?? "",
    done: result.completed,
  }
}

export async function updateSubtask(subtaskId: string, updates: { title?: string; completed?: boolean }): Promise<Subtask> {
  const result = await fetchJson<ApiSubtaskResponse>(
    `${API_BASE_URL}/api/subtasks/${subtaskId}`,
    {
      method: "PATCH",
      body: JSON.stringify(updates),
    }
  )
  return {
    id: normalizeId(result.id),
    title: result.title ?? "",
    done: result.completed,
  }
}

export async function deleteSubtask(subtaskId: string): Promise<void> {
  await fetchJson(`${API_BASE_URL}/api/subtasks/${subtaskId}`, {
    method: "DELETE",
  })
}

// ==========================
// PROJECTS
// ==========================

export async function getProjects(): Promise<Project[]> {
  try {
    const data = await fetchJson<ApiProjectResponse[]>(`${API_BASE_URL}/api/projects/my`)
    const projects = data.map((project) => mapApiProject(project))
    console.log("Loaded projects:", projects)
    _projects = [...projects]
    return projects
  } catch (err) {
    console.warn("Failed to load projects from API.", err)
    return []
  }
}

export interface CreateProjectInput {
  name: string
  color: string
  description?: string
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const payload = {
    name: input.name,
    description: input.description,
    teamId: DEFAULT_TEAM_ID,
  }

  try {
    const result = await fetchJson<ApiProjectResponse>(`${API_BASE_URL}/api/projects`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
    const project = mapApiProject(result, input.color)
    _projects = [..._projects, project]
    return project
  } catch (err) {
    console.warn("Failed to create project through API, using local fallback.", err)
    const project: Project = {
      id: genId("p"),
      name: input.name,
      color: input.color,
      description: input.description || "",
      tasksCount: 0,
      completedCount: 0,
    }
    _projects = [..._projects, project]
    return project
  }
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const payload: Record<string, unknown> = {}
  if (updates.name !== undefined) payload.name = updates.name
  if (updates.description !== undefined) payload.description = updates.description

  try {
    const result = await fetchJson<ApiProjectResponse>(`${API_BASE_URL}/api/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
    const updated = mapApiProject(result, updates.color)
    _projects = _projects.map((p) => (p.id === id ? updated : p))
    return updated
  } catch (err) {
    console.warn("Failed to update project through API, using local fallback.", err)
    const idx = _projects.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error(`Project ${id} not found`)
    _projects[idx] = { ..._projects[idx], ...updates }
    return _projects[idx]
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    await fetchJson(`${API_BASE_URL}/api/projects/${id}`, { method: "DELETE" })
    _projects = _projects.filter((p) => p.id !== id)
  } catch (err) {
    console.warn("Failed to delete project through API, using local fallback.", err)
    _projects = _projects.filter((p) => p.id !== id)
  }
}

// ==========================
// USERS
// ==========================

export async function getMyTeamMembers(): Promise<User[]> {
  try {
    const data = await fetchJson<ApiTeamWithMembersResponse[]>(`${API_BASE_URL}/api/teams/my-with-members`)
    console.log("Team members API response:", data)

    const membersById = new Map<string, User>()
    data.forEach((team) => {
      team.members.forEach((member) => {
        const id = normalizeId(member.userId)
        if (!membersById.has(id)) {
          const name = member.userName || member.email || "Unknown User"
          membersById.set(id, {
            id,
            name,
            avatar: toAvatar(name),
            role: member.position || "User",
            email: member.email || "",
          })
        }
      })
    })

    const result = Array.from(membersById.values())
    console.log("Mapped team members:", result)
    return result
  } catch (err) {
    console.warn("Failed to load team members from API.", err)
    return []
  }
}

export interface TeamWithMembers {
  teamId: string
  teamName: string
  members: {
    userId: string
    userName: string
    role: string
    email: string
  }[]
}

export async function getMyTeamsWithMembers(): Promise<TeamWithMembers[]> {
  try {
    const data = await fetchJson<ApiTeamWithMembersResponse[]>(`${API_BASE_URL}/api/teams/my-with-members`)
    return data.map((team) => ({
      teamId: normalizeId(team.teamId),
      teamName: team.teamName,
      members: team.members.map((m) => ({
        userId: normalizeId(m.userId),
        userName: m.userName || m.email || "Unknown User",
        role: m.position || "User",
        email: m.email || "",
      })),
    }))
  } catch (err) {
    console.warn("Failed to load teams from API.", err)
    return []
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    const data = await fetchJson<ApiUserResponse[]>(`${API_BASE_URL}/api/admin/users`)
    const result = data.map(mapApiUser)
    console.log("Admin users:", result)
    return result
  } catch (err) {
    console.warn("Failed to load users from API.", err)
    return []
  }
}

export interface CreateUserInput {
  name: string
  email: string
  role: "USER" | "ADMIN"
  password?: string
}

export async function adminCreateUser(input: CreateUserInput): Promise<User> {
  const result = await fetchJson<ApiUserResponse>(`${API_BASE_URL}/api/admin/users`, {
    method: "POST",
    body: JSON.stringify(input),
  })
  return mapApiUser(result)
}

export async function adminChangeUserRole(id: string, role: "USER" | "ADMIN"): Promise<User> {
  const result = await fetchJson<ApiUserResponse>(
    `${API_BASE_URL}/api/admin/users/${id}/role?role=${role}`,
    {
      method: "PUT",
    }
  )
  return mapApiUser(result)
}

export async function adminDeleteUser(id: string): Promise<void> {
  await fetchJson(`${API_BASE_URL}/api/admin/users/${id}`, {
    method: "DELETE",
  })
}

export async function adminGetProjects(): Promise<Project[]> {
  try {
    const data = await fetchJson<ApiProjectResponse[]>(`${API_BASE_URL}/api/admin/projects`)
    return data.map((p) => mapApiProject(p))
  } catch (err) {
    console.warn("Failed to load admin projects", err)
    return []
  }
}

export async function adminDeleteProject(id: string): Promise<void> {
  await fetchJson(`${API_BASE_URL}/api/admin/projects/${id}`, {
    method: "DELETE",
  })
}

export async function adminGetTasks(): Promise<Task[]> {
  try {
    const data = await fetchJson<ApiTaskResponse[]>(`${API_BASE_URL}/api/admin/tasks`)
    return data.map(mapApiTask)
  } catch (err) {
    console.warn("Failed to load admin tasks from API", err)
    return []
  }
}

export async function adminDeleteTask(id: string): Promise<void> {
  await fetchJson(`${API_BASE_URL}/api/admin/tasks/${id}`, {
    method: "DELETE",
  })
}

export async function adminGetTeams(): Promise<TeamWithMembers[]> {
  try {
    const data = await fetchJson<ApiTeamWithMembersResponse[]>(`${API_BASE_URL}/api/admin/teams`)
    return data.map((team) => ({
      teamId: normalizeId(team.teamId),
      teamName: team.teamName,
      members: team.members.map((m) => ({
        userId: normalizeId(m.userId),
        userName: m.userName || m.email || "Unknown User",
        role: m.position || "User",
        email: m.email || "",
      })),
    }))
  } catch (err) {
    console.warn("Failed to load admin teams", err)
    return []
  }
}


// ==========================
// NOTIFICATIONS
// ==========================

function mapApiNotification(n: any): Notification {
  return {
    id: normalizeId(n.id),
    type: (n.type || "mention").toLowerCase() as any,
    title: n.title,
    description: n.description,
    read: n.read,
    createdAt: n.createdAt,
  }
}

export async function getNotifications(): Promise<Notification[]> {
  try {
    const data = await fetchJson<any[]>(`${API_BASE_URL}/api/notifications`)
    return data.map(mapApiNotification)
  } catch (err) {
    console.warn("Failed to load notifications from API.", err)
    return []
  }
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const data = await fetchJson<any>(`${API_BASE_URL}/api/notifications/${id}/read`, {
    method: "PATCH",
  })
  return mapApiNotification(data)
}

export async function markAllNotificationsRead(): Promise<void> {
  await fetchJson(`${API_BASE_URL}/api/notifications/read-all`, {
    method: "POST",
  })
}

export async function clearAllNotifications(): Promise<void> {
  await fetchJson(`${API_BASE_URL}/api/notifications`, {
    method: "DELETE",
  })
}

// ==========================
// TASK COUNTS
// ==========================

export async function getTotalTasksCount(): Promise<number> {
  try {
    return await fetchJson<number>(`${API_BASE_URL}/api/projects/my/tasks-total`)
  } catch (err) {
    console.warn("Failed to load total tasks count from API.", err)
    return 0
  }
}

export async function getCompletedTasksCount(): Promise<number> {
  try {
    return await fetchJson<number>(`${API_BASE_URL}/api/tasks/my/completed/count`)
  } catch (err) {
    console.warn("Failed to load completed tasks count from API.", err)
    return 0
  }
}

export async function getInProgressTasksCount(): Promise<number> {
  try {
    return await fetchJson<number>(`${API_BASE_URL}/api/tasks/my/in-progress/count`)
  } catch (err) {
    console.warn("Failed to load in-progress tasks count from API.", err)
    return 0
  }
}

export async function getOverdueTasksCount(): Promise<number> {
  try {
    return await fetchJson<number>(`${API_BASE_URL}/api/tasks/my/overdue/count`)
  } catch (err) {
    console.warn("Failed to load overdue tasks count from API.", err)
    return 0
  }
}

// ==========================
// SETTINGS
// ==========================

export async function getSettings(): Promise<AppSettings | null> {
  if (!_settings.profile.name) {
    try {
      const user = await getCurrentUser()
      _settings.profile = {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      }
    } catch (err) {
      console.warn("Failed to fetch current user to populate settings profile.", err)
    }
  }
  return { ..._settings }
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
  await delay(100)
  _settings = { ..._settings, ...updates }
  return { ..._settings }
}

// ==========================
// INVITATIONS
// ==========================

export interface Invitation {
  id: string
  teamId: string
  teamName: string
  inviterId: string
  inviterName: string
  position: string
  status: string
  createdAt: string
}

function mapApiInvitation(apiInv: any): Invitation {
  return {
    id: normalizeId(apiInv.id),
    teamId: normalizeId(apiInv.teamId),
    teamName: apiInv.teamName,
    inviterId: normalizeId(apiInv.inviterId),
    inviterName: apiInv.inviterName,
    position: apiInv.position || "MEMBER",
    status: apiInv.status || "PENDING",
    createdAt: apiInv.createdAt,
  }
}

export async function inviteUser(teamId: string, email: string, position: string): Promise<Invitation> {
  const data = await fetchJson<any>(`${API_BASE_URL}/api/teams/${teamId}/invitations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, position }),
  })
  return mapApiInvitation(data)
}

export async function getMyPendingInvitations(): Promise<Invitation[]> {
  try {
    const data = await fetchJson<any[]>(`${API_BASE_URL}/api/invitations/my/pending`)
    return data.map(mapApiInvitation)
  } catch (err) {
    console.warn("Failed to fetch pending invitations.", err)
    return []
  }
}

export async function getTeamPendingInvitations(teamId: string): Promise<Invitation[]> {
  try {
    const data = await fetchJson<any[]>(`${API_BASE_URL}/api/teams/${teamId}/invitations/pending`)
    return data.map(mapApiInvitation)
  } catch (err) {
    console.warn("Failed to fetch team pending invitations.", err)
    return []
  }
}

export async function acceptInvitation(id: string): Promise<void> {
  await fetchJson(`${API_BASE_URL}/api/invitations/${id}/accept`, { method: "POST" })
}

export async function declineInvitation(id: string): Promise<void> {
  await fetchJson(`${API_BASE_URL}/api/invitations/${id}/decline`, { method: "POST" })
}

export async function removeTeamMember(teamId: string, userId: string): Promise<void> {
  await fetchJson(`${API_BASE_URL}/api/teams/${teamId}/members/${userId}`, {
    method: "DELETE",
  })
}

export interface SystemMetrics {
  cpuUsage: number
  memoryUsage: number
  activeDbConnections: number
  maxDbConnections: number
  uptime: number
}

export async function getSystemMetrics(): Promise<SystemMetrics> {
  return await fetchJson<SystemMetrics>(`${API_BASE_URL}/api/admin/system/metrics`)
}

export interface SendNotificationRequest {
  userId?: string | number | null
  title: string
  description: string
  type?: string
}

export async function sendAdminNotification(request: SendNotificationRequest): Promise<any> {
  return await fetchJson<any>(`${API_BASE_URL}/api/notifications/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: request.userId ? Number(request.userId) : null,
      title: request.title,
      description: request.description,
      type: request.type || "INFO",
    }),
  })
}

