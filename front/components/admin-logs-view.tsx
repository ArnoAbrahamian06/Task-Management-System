"use client"

import { useState } from "react"
import { useTaskContext } from "@/lib/task-context"
import { Search, Filter, RefreshCw, ShieldAlert, ShieldCheck, Info } from "lucide-react"

interface AuditLog {
  id: string
  timestamp: string
  severity: "INFO" | "SUCCESS" | "WARNING" | "ERROR"
  component: string
  message: string
  operator: string
}

export function AdminLogsView() {
  const { settings } = useTaskContext()
  const isRu = settings?.appearance.language === "ru"

  const [search, setSearch] = useState("")
  const [severityFilter, setSeverityFilter] = useState("ALL")

  // High fidelity audit logs
  const [logs, setLogs] = useState<AuditLog[]>([
    {
      id: "log-1",
      timestamp: "2026-05-29 03:32:15",
      severity: "SUCCESS",
      component: "AuthService",
      message: "User administrator@taskflow.com successfully authenticated via JWT",
      operator: "administrator@taskflow.com",
    },
    {
      id: "log-2",
      timestamp: "2026-05-29 03:28:44",
      severity: "INFO",
      component: "TeamService",
      message: "Global membership synchronization executed. 14 team relationships validated.",
      operator: "System",
    },
    {
      id: "log-3",
      timestamp: "2026-05-29 02:15:02",
      severity: "WARNING",
      component: "SecurityService",
      message: "Method security intercept on ProjectService.deleteProject - authorization bypassed by ADMIN privilege",
      operator: "administrator@taskflow.com",
    },
    {
      id: "log-4",
      timestamp: "2026-05-28 23:55:18",
      severity: "SUCCESS",
      component: "ProjectService",
      message: "New project 'Marketing Campaign 2026' created and bound to Team 4",
      operator: "igor.fursov@taskflow.com",
    },
    {
      id: "log-5",
      timestamp: "2026-05-28 21:04:12",
      severity: "ERROR",
      component: "Logback",
      message: "Handler dispatch failed: java.lang.NoClassDefFoundError: ch/qos/logback/classic/spi/ThrowableProxy",
      operator: "System",
    },
    {
      id: "log-6",
      timestamp: "2026-05-28 18:40:00",
      severity: "INFO",
      component: "Flyway",
      message: "Database schema migration V15__create_notifications_table.sql applied successfully",
      operator: "System",
    },
    {
      id: "log-7",
      timestamp: "2026-05-28 17:12:45",
      severity: "SUCCESS",
      component: "UserService",
      message: "User account 'liza.lagereva@taskflow.com' registered. Role defaults to USER",
      operator: "liza.lagereva@taskflow.com",
    },
  ])

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.component.toLowerCase().includes(search.toLowerCase()) ||
      log.operator.toLowerCase().includes(search.toLowerCase())
    const matchesSeverity = severityFilter === "ALL" || log.severity === severityFilter
    return matchesSearch && matchesSeverity
  })

  return (
    <div className="p-6 space-y-6 flex flex-col h-full overflow-y-auto">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">{isRu ? "Журнал аудита системы" : "System Audit Logs"}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isRu
              ? "Хронологический список системных событий, изменений настроек прав и операций пользователей"
              : "Chronological ledger of security intercept events, administrative changes, and user operations"}
          </p>
        </div>
        <button
          onClick={() => {
            // Fake refresh animation by shuffling times
            setLogs((prev) =>
              prev.map((l) => ({
                ...l,
                id: Math.random().toString(),
              }))
            )
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-card hover:bg-accent text-xs font-semibold text-foreground transition-all shrink-0"
        >
          <RefreshCw className="size-3.5" />
          {isRu ? "Обновить лог" : "Refresh"}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={isRu ? "Поиск по компонентам или сообщениям..." : "Search by component, message, operator..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input/40 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60 h-10 text-foreground"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg border border-border bg-input/40 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-10 w-44"
          >
            <option value="ALL">{isRu ? "Все уровни" : "All Severities"}</option>
            <option value="INFO">INFO</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="WARNING">WARNING</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="flex-1 border border-border/80 rounded-xl bg-card overflow-hidden shadow-sm flex flex-col min-h-[300px]">
        <div className="overflow-x-auto w-full flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/30 text-[11px] font-bold text-muted-foreground uppercase">
                <th className="p-4 w-[160px]">{isRu ? "Время" : "Timestamp"}</th>
                <th className="p-4 w-[110px]">{isRu ? "Статус" : "Severity"}</th>
                <th className="p-4 w-[140px]">{isRu ? "Компонент" : "Component"}</th>
                <th className="p-4">{isRu ? "Событие" : "Event Message"}</th>
                <th className="p-4 w-[180px]">{isRu ? "Инициатор" : "Operator"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs text-foreground">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  let severityStyles = "bg-blue-500/10 text-blue-500"
                  let severityIcon = <Info className="size-3" />
                  if (log.severity === "SUCCESS") {
                    severityStyles = "bg-emerald-500/10 text-emerald-500"
                    severityIcon = <ShieldCheck className="size-3" />
                  } else if (log.severity === "WARNING") {
                    severityStyles = "bg-amber-500/10 text-amber-500"
                    severityIcon = <ShieldAlert className="size-3" />
                  } else if (log.severity === "ERROR") {
                    severityStyles = "bg-destructive/10 text-destructive font-semibold"
                    severityIcon = <ShieldAlert className="size-3" />
                  }

                  return (
                    <tr key={log.id} className="hover:bg-accent/15 transition-colors">
                      <td className="p-4 whitespace-nowrap text-muted-foreground font-mono">{log.timestamp}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${severityStyles}`}>
                          {severityIcon}
                          {log.severity}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap font-semibold text-muted-foreground font-mono">{log.component}</td>
                      <td className="p-4 leading-relaxed max-w-md font-mono">{log.message}</td>
                      <td className="p-4 whitespace-nowrap truncate max-w-[180px] font-mono text-muted-foreground">{log.operator}</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    {isRu ? "Записи аудита не найдены." : "No matching audit log events found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
