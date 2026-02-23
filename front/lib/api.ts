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

// Change this to your real API base URL when ready
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

// Simulates network delay for realistic UX during development
function delay(ms = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---- Internal mutable state (simulates database) ----
let _tasks = [...mockTasks]
let _projects = [...mockProjects]
let _notifications = [...mockNotifications]
let _settings = { ...mockSettings }
let _nextId = 100

function genId(prefix: string) {
  _nextId++
  return `${prefix}${_nextId}`
}

// ==========================
// TASKS
// ==========================

export async function getTasks(): Promise<Task[]> {
  await delay(100)
  return [..._tasks]
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  await delay(50)
  return _tasks.find((t) => t.id === id)
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
  await delay(150)
  const now = new Date().toISOString()
  const task: Task = {
    id: genId("t"),
    title: input.title,
    description: input.description || "",
    status: input.status || "new",
    priority: input.priority || "medium",
    assigneeId: input.assigneeId || "u1",
    creatorId: input.creatorId || "u1",
    projectId: input.projectId || "p1",
    tags: input.tags || [],
    deadline: input.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    createdAt: now,
    updatedAt: now,
    comments: [],
    subtasks: [],
    timeEstimate: input.timeEstimate || 0,
    timeSpent: 0,
  }
  _tasks = [task, ..._tasks]

  // Update project counts
  const proj = _projects.find((p) => p.id === task.projectId)
  if (proj) {
    proj.tasksCount++
  }

  return task
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  await delay(100)
  const idx = _tasks.findIndex((t) => t.id === id)
  if (idx === -1) throw new Error(`Task ${id} not found`)

  const old = _tasks[idx]
  const updated = { ...old, ...updates, updatedAt: new Date().toISOString() }
  _tasks[idx] = updated

  // Update project counts if status changed to/from done
  if (updates.status && updates.status !== old.status) {
    const proj = _projects.find((p) => p.id === updated.projectId)
    if (proj) {
      if (updates.status === "done" && old.status !== "done") proj.completedCount++
      if (updates.status !== "done" && old.status === "done") proj.completedCount--
    }
  }

  return updated
}

export async function deleteTask(id: string): Promise<void> {
  await delay(100)
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

export async function toggleSubtask(taskId: string, subtaskId: string): Promise<Task> {
  await delay(50)
  const idx = _tasks.findIndex((t) => t.id === taskId)
  if (idx === -1) throw new Error(`Task ${taskId} not found`)
  _tasks[idx] = {
    ..._tasks[idx],
    subtasks: _tasks[idx].subtasks.map((s) =>
      s.id === subtaskId ? { ...s, done: !s.done } : s
    ),
    updatedAt: new Date().toISOString(),
  }
  return _tasks[idx]
}

// ==========================
// PROJECTS
// ==========================

export async function getProjects(): Promise<Project[]> {
  await delay(100)
  return [..._projects]
}

export interface CreateProjectInput {
  name: string
  color: string
  description?: string
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  await delay(150)
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

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  await delay(100)
  const idx = _projects.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error(`Project ${id} not found`)
  _projects[idx] = { ..._projects[idx], ...updates }
  return _projects[idx]
}

export async function deleteProject(id: string): Promise<void> {
  await delay(100)
  _projects = _projects.filter((p) => p.id !== id)
}

// ==========================
// USERS
// ==========================

export async function getUsers(): Promise<User[]> {
  await delay(100)
  return [...mockUsers]
}

// ==========================
// NOTIFICATIONS
// ==========================

export async function getNotifications(): Promise<Notification[]> {
  await delay(100)
  return [..._notifications]
}

export async function markNotificationRead(id: string): Promise<Notification> {
  await delay(50)
  const idx = _notifications.findIndex((n) => n.id === id)
  if (idx === -1) throw new Error(`Notification ${id} not found`)
  _notifications[idx] = { ..._notifications[idx], read: true }
  return _notifications[idx]
}

export async function markAllNotificationsRead(): Promise<void> {
  await delay(100)
  _notifications = _notifications.map((n) => ({ ...n, read: true }))
}

export async function clearAllNotifications(): Promise<void> {
  await delay(100)
  _notifications = []
}

// ==========================
// SETTINGS
// ==========================

export async function getSettings(): Promise<AppSettings> {
  await delay(100)
  return { ..._settings }
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
  await delay(100)
  _settings = { ..._settings, ...updates }
  return { ..._settings }
}
