"use client"

import { useState } from "react"
import {
  User,
  Palette,
  Save,
  Moon,
  Sun,
  Monitor,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useTaskContext } from "@/lib/task-context"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

type SettingsTab = "profile" | "appearance"

const tabs: { id: SettingsTab; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
]

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile")
  const { settings, updateSettings, t } = useTaskContext()

  if (!settings) return null

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Sidebar tabs */}
      <nav className="flex shrink-0 border-b border-border bg-card/50 md:w-56 md:flex-col md:border-b-0 md:border-r">
        <div className="flex overflow-x-auto px-2 py-2 md:flex-col md:px-3 md:py-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <tab.icon className="size-4" />
              {t(tab.id)}
            </button>
          ))}
        </div>
      </nav>

      {/* Content area */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        {activeTab === "profile" && <ProfileTab settings={settings} updateSettings={updateSettings} />}
        {activeTab === "appearance" && <AppearanceTab settings={settings} updateSettings={updateSettings} />}
      </div>
    </div>
  )
}

function ProfileTab({ settings, updateSettings }: { settings: NonNullable<ReturnType<typeof useTaskContext>["settings"]>; updateSettings: ReturnType<typeof useTaskContext>["updateSettings"] }) {
  const { t } = useTaskContext()
  const [name, setName] = useState(settings.profile.name)
  const [email, setEmail] = useState(settings.profile.email)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await updateSettings({ profile: { ...settings.profile, name, email } })
    setSaving(false)
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{t("profileSettings")}</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your personal information and account details</p>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="size-16">
              <AvatarFallback className="bg-primary/20 text-primary text-xl font-semibold">
                {settings.profile.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-base font-medium text-foreground">{settings.profile.name}</h3>
              <p className="text-sm text-muted-foreground">{settings.profile.role}</p>
              <Button variant="outline" size="sm" className="mt-2 text-xs">
                {t("changeAvatar")}
              </Button>
            </div>
          </div>

          <Separator className="mb-6" />

          <div className="flex flex-col gap-4">
            <SettingsField label={t("fullName")}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </SettingsField>

            <SettingsField label={t("email")}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </SettingsField>

            <SettingsField label={t("role")}>
              <input
                type="text"
                value={settings.profile.role}
                disabled
                className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
              />
            </SettingsField>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="size-4" />
              {saving ? t("saving") : t("saveChanges")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const themesList = [
  {
    id: "light",
    labelEn: "Light",
    labelRu: "Светлая",
    icon: Sun,
    colors: {
      bg: "oklch(0.98 0.005 260)",
      card: "oklch(1 0 0)",
      primary: "oklch(0.55 0.18 250)",
    }
  },
  {
    id: "dark",
    labelEn: "Bitrix Dark",
    labelRu: "Темный Битрикс",
    icon: Moon,
    colors: {
      bg: "oklch(0.16 0.005 260)",
      card: "oklch(0.19 0.005 260)",
      primary: "oklch(0.65 0.2 250)",
    }
  },
  {
    id: "midnight",
    labelEn: "Midnight Space",
    labelRu: "Полуночный космос",
    icon: Moon,
    colors: {
      bg: "oklch(0.12 0.02 260)",
      card: "oklch(0.15 0.03 260)",
      primary: "oklch(0.65 0.22 280)",
    }
  },
  {
    id: "sunset",
    labelEn: "Crimson Sunset",
    labelRu: "Багровый закат",
    icon: Sun,
    colors: {
      bg: "oklch(0.13 0.025 25)",
      card: "oklch(0.17 0.03 25)",
      primary: "oklch(0.68 0.18 45)",
    }
  },
  {
    id: "forest",
    labelEn: "Emerald Forest",
    labelRu: "Изумрудный лес",
    icon: Palette,
    colors: {
      bg: "oklch(0.13 0.025 145)",
      card: "oklch(0.16 0.03 145)",
      primary: "oklch(0.70 0.18 145)",
    }
  },
  {
    id: "nord",
    labelEn: "Nordic Frost",
    labelRu: "Нордический лед",
    icon: Monitor,
    colors: {
      bg: "oklch(0.23 0.015 230)",
      card: "oklch(0.27 0.02 230)",
      primary: "oklch(0.76 0.11 210)",
    }
  },
  {
    id: "cyberpunk",
    labelEn: "Cyberpunk Neon",
    labelRu: "Киберпанк",
    icon: Palette,
    colors: {
      bg: "oklch(0.10 0.01 320)",
      card: "oklch(0.13 0.02 320)",
      primary: "oklch(0.70 0.28 328)",
    }
  },
  {
    id: "system",
    labelEn: "System Theme",
    labelRu: "Системная тема",
    icon: Monitor,
    colors: {
      bg: "oklch(0.14 0.005 260)",
      card: "oklch(0.2 0.005 260)",
      primary: "oklch(0.6 0.2 250)",
    }
  }
]

function AppearanceTab({ settings, updateSettings }: { settings: NonNullable<ReturnType<typeof useTaskContext>["settings"]>; updateSettings: ReturnType<typeof useTaskContext>["updateSettings"] }) {
  const { setTheme } = useTheme()
  const { t } = useTaskContext()
  const isRu = settings.appearance.language === "ru"

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{t("appearance")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isRu ? "Настройте внешний вид TaskFlow под свои предпочтения" : "Customize how TaskFlow looks for you"}
        </p>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Palette className="size-4 text-primary" />
            {t("theme")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {themesList.map((tInfo) => {
              const IconComponent = tInfo.icon
              const isSelected = settings.appearance.theme === tInfo.id
              const themeLabel = isRu ? tInfo.labelRu : tInfo.labelEn

              return (
                <button
                  key={tInfo.id}
                  onClick={() => {
                    updateSettings({ appearance: { ...settings.appearance, theme: tInfo.id } })
                    setTheme(tInfo.id)
                  }}
                  className={cn(
                    "group flex flex-col items-stretch gap-2.5 rounded-xl border-2 p-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] select-none text-left cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                      : "border-border hover:border-primary/45 hover:bg-accent/30"
                  )}
                >
                  {/* Theme Mockup Visual Swatch */}
                  <div 
                    className="w-full h-16 rounded-lg border border-border/60 overflow-hidden flex relative shadow-sm group-hover:shadow-md transition-shadow"
                    style={{ backgroundColor: tInfo.colors.bg }}
                  >
                    {/* Mini Sidebar */}
                    <div 
                      className="w-1/4 h-full border-r border-border/40" 
                      style={{ backgroundColor: tInfo.colors.card }}
                    />
                    {/* Mini Main Content Area */}
                    <div className="flex-1 p-2 flex flex-col gap-1.5 justify-start">
                      {/* Mini header/bars */}
                      <div className="h-1.5 w-2/3 rounded-full opacity-60" style={{ backgroundColor: tInfo.colors.primary }} />
                      <div className="h-1 w-full rounded-full opacity-30" style={{ backgroundColor: tInfo.colors.primary }} />
                      <div className="h-1 w-5/6 rounded-full opacity-30" style={{ backgroundColor: tInfo.colors.primary }} />
                      {/* Mini Accent dot */}
                      <div className="size-2 rounded-full absolute bottom-2 right-2 shadow-sm" style={{ backgroundColor: tInfo.colors.primary }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-xs font-semibold text-foreground truncate mr-2">
                      {themeLabel}
                    </span>
                    <IconComponent className={cn(
                      "size-3.5 shrink-0 transition-colors",
                      isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Palette className="size-4 text-primary" />
            {t("language")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <select
            value={settings.appearance.language}
            onChange={(e) => updateSettings({ appearance: { ...settings.appearance, language: e.target.value } })}
            className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="en">English</option>
            <option value="ru">Russian</option>
          </select>
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}
