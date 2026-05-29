"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { useTaskContext } from "@/lib/task-context"
import { sendAdminNotification } from "@/lib/api"
import { Bell, Info, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react"

interface SendNotificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialUserId?: string | number | null
}

export function SendNotificationDialog({ open, onOpenChange, initialUserId = null }: SendNotificationDialogProps) {
  const { users, settings, refreshData } = useTaskContext()
  const isRu = settings?.appearance.language === "ru"

  const [loading, setLoading] = useState(false)
  const [recipientId, setRecipientId] = useState<string>("all")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("INFO")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (open) {
      setRecipientId(initialUserId ? String(initialUserId) : "all")
      setTitle("")
      setDescription("")
      setType("INFO")
      setErrorMessage("")
    }
  }, [open, initialUserId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      setErrorMessage(isRu ? "Пожалуйста, заполните все обязательные поля" : "Please fill out all required fields")
      return
    }

    setLoading(true)
    setErrorMessage("")

    try {
      await sendAdminNotification({
        userId: recipientId === "all" ? null : recipientId,
        title: title.trim(),
        description: description.trim(),
        type,
      })

      // Try refreshing notifications or user context data
      if (refreshData) {
        await refreshData()
      }

      onOpenChange(false)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-card border border-border rounded-xl shadow-2xl p-6">
        <DialogHeader className="flex flex-col gap-1.5 pb-4 border-b border-border/60">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Bell className="size-5 text-primary shrink-0 animate-bounce" />
            {isRu ? "Отправить уведомление" : "Send System Notification"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isRu
              ? "Отправьте личное уведомление конкретному пользователю или сделайте массовое объявление для всех участников."
              : "Dispatch a targeted notification to an individual or system-wide broadcast to all workspace members."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {errorMessage && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive flex items-center gap-2">
              <ShieldAlert className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Recipient Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              {isRu ? "Получатель" : "Recipient"}
            </label>
            <select
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              className="rounded-lg border border-border bg-input/40 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-10 w-full"
            >
              <option value="all">{isRu ? "📢 Всем пользователям (Рассылка)" : "📢 All Users (System Broadcast)"}</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  👤 {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Notification Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              {isRu ? "Тип уведомления" : "Notification Type"}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { val: "INFO", label: isRu ? "Инфо" : "Info", color: "border-blue-500 bg-blue-500/10 text-blue-500" },
                { val: "SUCCESS", label: isRu ? "Успех" : "Success", color: "border-emerald-500 bg-emerald-500/10 text-emerald-500" },
                { val: "WARNING", label: isRu ? "Предупр." : "Warning", color: "border-amber-500 bg-amber-500/10 text-amber-500" },
                { val: "ERROR", label: isRu ? "Ошибка" : "Error", color: "border-destructive bg-destructive/10 text-destructive" },
              ].map((t) => (
                <button
                  key={t.val}
                  type="button"
                  onClick={() => setType(t.val)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-xs font-semibold transition-all ${
                    type === t.val ? t.color + " ring-1 ring-primary" : "border-border/60 hover:bg-accent/40 text-muted-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              {isRu ? "Заголовок" : "Title"} *
            </label>
            <input
              type="text"
              placeholder={isRu ? "Например: Обновление системы" : "e.g. System Update"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-input/40 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60 h-10 text-foreground"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              {isRu ? "Сообщение" : "Message"} *
            </label>
            <textarea
              placeholder={isRu ? "Введите текст уведомления..." : "Enter notification details..."}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-border bg-input/40 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60 resize-none text-foreground"
            />
          </div>

          <DialogFooter className="pt-4 border-t border-border/60 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-lg h-10"
            >
              {isRu ? "Отмена" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-lg h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5"
            >
              {loading ? (isRu ? "Отправка..." : "Sending...") : isRu ? "Отправить" : "Dispatch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
