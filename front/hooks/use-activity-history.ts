import { useState, useEffect, useCallback } from "react"
import type { Task } from "@/lib/data"
import { activityHistoryUtils, type ActivityEntry } from "@/lib/activity-history"

export function useActivityHistory() {
  const [history, setHistory] = useState<ActivityEntry[]>([])
  const [loaded, setLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = activityHistoryUtils.loadHistory()
    setHistory(loaded)
    setLoaded(true)
  }, [])

  // Add activity entry
  const addActivity = useCallback(
    (task: Task, userId: string, userName: string) => {
      const updated = activityHistoryUtils.addActivity(task, userId, userName)
      setHistory(updated)
    },
    []
  )

  // Get recent activity (last N entries)
  const getRecentActivity = useCallback(
    (limit: number = 5): ActivityEntry[] => {
      return history.slice(0, limit)
    },
    [history]
  )

  // Clear history
  const clearHistory = useCallback(() => {
    activityHistoryUtils.clearHistory()
    setHistory([])
  }, [])

  return {
    history,
    loaded,
    addActivity,
    getRecentActivity,
    clearHistory,
  }
}
