import type { Task } from "@/lib/data"

export interface ActivityEntry {
  taskId: string
  taskTitle: string
  userId: string
  userName: string
  status: string
  timestamp: string
}

const STORAGE_KEY = "taskflow_activity_history"
const MAX_ENTRIES = 50

export const activityHistoryUtils = {
  // Load history from localStorage
  loadHistory(): ActivityEntry[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as ActivityEntry[]) : []
    } catch (err) {
      console.error("Failed to load activity history:", err)
      return []
    }
  },

  // Save history to localStorage
  saveHistory(entries: ActivityEntry[]): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
    } catch (err) {
      console.error("Failed to save activity history:", err)
    }
  },

  // Add new activity entry
  addActivity(
    task: Task,
    userId: string,
    userName: string
  ): ActivityEntry[] {
    const entry: ActivityEntry = {
      taskId: task.id,
      taskTitle: task.title,
      userId,
      userName,
      status: task.status,
      timestamp: new Date().toISOString(),
    }

    const current = this.loadHistory()

    // Check if entry already exists to avoid duplicates
    const isDuplicate = current.some(
      (e) =>
        e.taskId === entry.taskId &&
        e.status === entry.status &&
        new Date(e.timestamp).getTime() > Date.now() - 1000 // Within 1 second
    )

    if (isDuplicate) return current

    const updated = [entry, ...current].slice(0, MAX_ENTRIES)
    this.saveHistory(updated)
    return updated
  },

  // Clear all history
  clearHistory(): void {
    if (typeof window === "undefined") return

    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (err) {
      console.error("Failed to clear activity history:", err)
    }
  },
}
