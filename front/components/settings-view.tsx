"use client"

import { useState } from "react"
import {
  User,
  Bell,
  Palette,
  Building2,
  Plug,
  Save,
  Globe,
  Moon,
  Sun,
  Mail,
  Smartphone,
  Monitor,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useTaskContext } from "@/lib/task-context"
import { cn } from "@/lib/utils"

type SettingsTab = "profile" | "notifications" | "appearance" | "workspace" | "integrations"

const tabs: { id: SettingsTab; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "workspace", label: "Workspace", icon: Building2 },
  { id: "integrations", label: "Integrations", icon: Plug },
]

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile")
  const { settings, updateSettings } = useTaskContext()

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
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content area */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        {activeTab === "profile" && <ProfileTab settings={settings} updateSettings={updateSettings} />}
        {activeTab === "notifications" && <NotificationsTab settings={settings} updateSettings={updateSettings} />}
        {activeTab === "appearance" && <AppearanceTab settings={settings} updateSettings={updateSettings} />}
        {activeTab === "workspace" && <WorkspaceTab settings={settings} updateSettings={updateSettings} />}
        {activeTab === "integrations" && <IntegrationsTab />}
      </div>
    </div>
  )
}

function ProfileTab({ settings, updateSettings }: { settings: NonNullable<ReturnType<typeof useTaskContext>["settings"]>; updateSettings: ReturnType<typeof useTaskContext>["updateSettings"] }) {
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
        <h2 className="text-lg font-semibold text-foreground">Profile Settings</h2>
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
                Change avatar
              </Button>
            </div>
          </div>

          <Separator className="mb-6" />

          <div className="flex flex-col gap-4">
            <SettingsField label="Full name">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </SettingsField>

            <SettingsField label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </SettingsField>

            <SettingsField label="Role">
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
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function NotificationsTab({ settings, updateSettings }: { settings: NonNullable<ReturnType<typeof useTaskContext>["settings"]>; updateSettings: ReturnType<typeof useTaskContext>["updateSettings"] }) {
  const notifSettings = settings.notifications

  const handleToggle = async (key: keyof typeof notifSettings) => {
    await updateSettings({
      notifications: { ...notifSettings, [key]: !notifSettings[key] },
    })
  }

  const groups = [
    {
      title: "Email Notifications",
      icon: Mail,
      items: [
        { key: "emailTaskAssigned" as const, label: "Task assigned to me", desc: "Get notified when a task is assigned to you" },
        { key: "emailComments" as const, label: "Comments & mentions", desc: "Get notified about new comments and mentions" },
        { key: "emailDeadlines" as const, label: "Deadline reminders", desc: "Get reminded about upcoming deadlines" },
      ],
    },
    {
      title: "Push Notifications",
      icon: Smartphone,
      items: [
        { key: "pushTaskAssigned" as const, label: "Task assigned to me", desc: "Push notification when a task is assigned" },
        { key: "pushComments" as const, label: "Comments & mentions", desc: "Push notification for comments and mentions" },
        { key: "pushDeadlines" as const, label: "Deadline reminders", desc: "Push notification for upcoming deadlines" },
      ],
    },
    {
      title: "In-App Notifications",
      icon: Monitor,
      items: [
        { key: "inAppTaskAssigned" as const, label: "Task assigned to me", desc: "Show in notification center" },
        { key: "inAppComments" as const, label: "Comments & mentions", desc: "Show in notification center" },
        { key: "inAppDeadlines" as const, label: "Deadline reminders", desc: "Show in notification center" },
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Notification Preferences</h2>
        <p className="text-sm text-muted-foreground mt-1">Choose how and when you want to be notified</p>
      </div>

      {groups.map((group) => (
        <Card key={group.title} className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <group.icon className="size-4 text-primary" />
              {group.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex flex-col gap-4">
              {group.items.map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifSettings[item.key]}
                    onCheckedChange={() => handleToggle(item.key)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function AppearanceTab({ settings, updateSettings }: { settings: NonNullable<ReturnType<typeof useTaskContext>["settings"]>; updateSettings: ReturnType<typeof useTaskContext>["updateSettings"] }) {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
        <p className="text-sm text-muted-foreground mt-1">Customize how TaskFlow looks for you</p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Palette className="size-4 text-primary" />
            Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-3 gap-3">
            {(["dark", "light", "system"] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => updateSettings({ appearance: { ...settings.appearance, theme } })}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors",
                  settings.appearance.theme === theme
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                )}
              >
                {theme === "dark" && <Moon className="size-6 text-foreground" />}
                {theme === "light" && <Sun className="size-6 text-foreground" />}
                {theme === "system" && <Monitor className="size-6 text-foreground" />}
                <span className="text-xs font-medium text-foreground capitalize">{theme}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Globe className="size-4 text-primary" />
            Language
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
            <option value="de">German</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
          </select>
        </CardContent>
      </Card>
    </div>
  )
}

function WorkspaceTab({ settings, updateSettings }: { settings: NonNullable<ReturnType<typeof useTaskContext>["settings"]>; updateSettings: ReturnType<typeof useTaskContext>["updateSettings"] }) {
  const { projects } = useTaskContext()
  const [name, setName] = useState(settings.workspace.name)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await updateSettings({ workspace: { ...settings.workspace, name } })
    setSaving(false)
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Workspace Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure your workspace preferences</p>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <SettingsField label="Workspace name">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </SettingsField>

            <SettingsField label="Default project">
              <select
                value={settings.workspace.defaultProjectId}
                onChange={(e) => updateSettings({ workspace: { ...settings.workspace, defaultProjectId: e.target.value } })}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </SettingsField>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="size-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function IntegrationsTab() {
  const integrations = [
    { name: "Slack", desc: "Send notifications to Slack channels", connected: false, icon: "S" },
    { name: "GitHub", desc: "Link commits and PRs to tasks", connected: true, icon: "G" },
    { name: "Figma", desc: "Embed Figma designs in tasks", connected: false, icon: "F" },
    { name: "Google Calendar", desc: "Sync deadlines with Google Calendar", connected: false, icon: "C" },
    { name: "Jira", desc: "Import and sync issues from Jira", connected: false, icon: "J" },
    { name: "Notion", desc: "Link Notion docs to projects", connected: false, icon: "N" },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Integrations</h2>
        <p className="text-sm text-muted-foreground mt-1">Connect third-party services to your workspace</p>
      </div>

      <div className="grid gap-3">
        {integrations.map((integ) => (
          <Card key={integ.name} className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-foreground">
                {integ.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-foreground">{integ.name}</h3>
                  {integ.connected && (
                    <Badge className="bg-success/15 text-success text-[10px] h-5">Connected</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{integ.desc}</p>
              </div>
              <Button variant={integ.connected ? "outline" : "default"} size="sm" className="text-xs">
                {integ.connected ? "Configure" : "Connect"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
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
