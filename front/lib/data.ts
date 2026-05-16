export type Priority = "urgent" | "high" | "medium" | "low"
export type Status = "new" | "in_progress" | "review" | "done" | "deferred"
export type NotificationType = "task_assigned" | "comment_added" | "deadline_approaching" | "status_changed" | "mention"

export interface User {
  id: string
  name: string
  avatar: string
  role: string
  email: string
}

export interface Comment {
  id: string
  userId: string
  text: string
  createdAt: string
}

export interface Subtask {
  id: string
  title: string
  done: boolean
}

export interface Task {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  assigneeId: string
  creatorId: string
  projectId: string
  projectName?: string
  tags: string[]
  deadline: string
  createdAt: string
  updatedAt: string
  comments: Comment[]
  subtasks: Subtask[]
  timeEstimate: number
  timeSpent: number
}

export interface Project {
  id: string
  name: string
  color: string
  description?: string
  tasksCount: number
  completedCount: number
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  description: string
  read: boolean
  createdAt: string
  taskId?: string
  userId?: string
}

export interface AppSettings {
  profile: { name: string; email: string; avatar: string; role: string }
  notifications: {
    emailTaskAssigned: boolean
    emailComments: boolean
    emailDeadlines: boolean
    pushTaskAssigned: boolean
    pushComments: boolean
    pushDeadlines: boolean
    inAppTaskAssigned: boolean
    inAppComments: boolean
    inAppDeadlines: boolean
  }
  appearance: { language: string; theme: string }
  workspace: { name: string; defaultProjectId: string }
}

// ---- Mock data ----

export const users: User[] = [
  { id: "u1", name: "Alexey Petrov", avatar: "AP", role: "Team Lead", email: "alexey@taskflow.io" },
  { id: "u2", name: "Marina Ivanova", avatar: "MI", role: "Frontend Dev", email: "marina@taskflow.io" },
  { id: "u3", name: "Dmitry Sokolov", avatar: "DS", role: "Backend Dev", email: "dmitry@taskflow.io" },
  { id: "u4", name: "Elena Kozlova", avatar: "EK", role: "Designer", email: "elena@taskflow.io" },
  { id: "u5", name: "Igor Volkov", avatar: "IV", role: "QA Engineer", email: "igor@taskflow.io" },
  { id: "u6", name: "Natalia Smirnova", avatar: "NS", role: "PM", email: "natalia@taskflow.io" },
]

export const projects: Project[] = [
  { id: "p1", name: "Website Redesign", color: "#4f8ff7", description: "Complete redesign of the corporate website with new brand identity", tasksCount: 24, completedCount: 16 },
  { id: "p2", name: "Mobile App", color: "#f59e0b", description: "Native mobile application for iOS and Android platforms", tasksCount: 18, completedCount: 7 },
  { id: "p3", name: "API v2.0", color: "#10b981", description: "Next generation REST and GraphQL API", tasksCount: 12, completedCount: 10 },
  { id: "p4", name: "Analytics Dashboard", color: "#8b5cf6", description: "Real-time analytics and reporting dashboard", tasksCount: 8, completedCount: 2 },
]

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Redesign main page header",
    description: "Update the main page header with the new brand guidelines. Include new logo, navigation items, and responsive behavior for mobile devices.",
    status: "in_progress",
    priority: "high",
    assigneeId: "u4",
    creatorId: "u6",
    projectId: "p1",
    tags: ["design", "ui"],
    deadline: "2026-02-25",
    createdAt: "2026-02-10T10:00:00",
    updatedAt: "2026-02-17T14:30:00",
    comments: [
      { id: "c1", userId: "u6", text: "Please follow the new brand book for colors and fonts", createdAt: "2026-02-10T10:05:00" },
      { id: "c2", userId: "u4", text: "Got it, starting with the wireframe today", createdAt: "2026-02-10T11:00:00" },
    ],
    subtasks: [
      { id: "s1", title: "Create wireframe", done: true },
      { id: "s2", title: "Design mockup in Figma", done: true },
      { id: "s3", title: "Export assets", done: false },
      { id: "s4", title: "Implement in code", done: false },
    ],
    timeEstimate: 16,
    timeSpent: 10,
  },
  {
    id: "t2",
    title: "Implement authentication flow",
    description: "Build complete authentication flow including login, registration, password reset, and email verification. Use JWT tokens for session management.",
    status: "in_progress",
    priority: "urgent",
    assigneeId: "u3",
    creatorId: "u1",
    projectId: "p2",
    tags: ["backend", "security"],
    deadline: "2026-02-22",
    createdAt: "2026-02-08T09:00:00",
    updatedAt: "2026-02-18T08:00:00",
    comments: [
      { id: "c3", userId: "u1", text: "This is critical for the beta launch, please prioritize", createdAt: "2026-02-08T09:05:00" },
    ],
    subtasks: [
      { id: "s5", title: "Setup JWT middleware", done: true },
      { id: "s6", title: "Login endpoint", done: true },
      { id: "s7", title: "Registration endpoint", done: false },
      { id: "s8", title: "Password reset flow", done: false },
      { id: "s9", title: "Email verification", done: false },
    ],
    timeEstimate: 24,
    timeSpent: 14,
  },
  {
    id: "t3",
    title: "Create component library docs",
    description: "Write documentation for all shared UI components with usage examples, props descriptions, and visual previews.",
    status: "review",
    priority: "medium",
    assigneeId: "u2",
    creatorId: "u1",
    projectId: "p1",
    tags: ["docs", "frontend"],
    deadline: "2026-02-28",
    createdAt: "2026-02-12T13:00:00",
    updatedAt: "2026-02-17T16:00:00",
    comments: [],
    subtasks: [
      { id: "s10", title: "Button component docs", done: true },
      { id: "s11", title: "Form components docs", done: true },
      { id: "s12", title: "Layout components docs", done: true },
      { id: "s13", title: "Data display docs", done: false },
    ],
    timeEstimate: 12,
    timeSpent: 9,
  },
  {
    id: "t4",
    title: "Optimize database queries",
    description: "Profile and optimize slow database queries. Focus on the dashboard aggregation queries and user search.",
    status: "new",
    priority: "high",
    assigneeId: "u3",
    creatorId: "u6",
    projectId: "p3",
    tags: ["backend", "performance"],
    deadline: "2026-03-01",
    createdAt: "2026-02-15T10:00:00",
    updatedAt: "2026-02-15T10:00:00",
    comments: [],
    subtasks: [
      { id: "s14", title: "Profile current queries", done: false },
      { id: "s15", title: "Add missing indexes", done: false },
      { id: "s16", title: "Rewrite aggregation queries", done: false },
    ],
    timeEstimate: 8,
    timeSpent: 0,
  },
  {
    id: "t5",
    title: "Design analytics dashboard mockup",
    description: "Create high-fidelity mockups for the analytics dashboard showing KPIs, charts, and data tables.",
    status: "done",
    priority: "medium",
    assigneeId: "u4",
    creatorId: "u6",
    projectId: "p4",
    tags: ["design", "analytics"],
    deadline: "2026-02-20",
    createdAt: "2026-02-05T09:00:00",
    updatedAt: "2026-02-16T17:00:00",
    comments: [
      { id: "c4", userId: "u6", text: "Looks great! Approved.", createdAt: "2026-02-16T17:00:00" },
    ],
    subtasks: [
      { id: "s17", title: "KPI cards layout", done: true },
      { id: "s18", title: "Chart section design", done: true },
      { id: "s19", title: "Data table mockup", done: true },
    ],
    timeEstimate: 10,
    timeSpent: 10,
  },
  {
    id: "t6",
    title: "Setup CI/CD pipeline",
    description: "Configure GitHub Actions for automated testing, linting, and deployment to staging and production.",
    status: "done",
    priority: "high",
    assigneeId: "u1",
    creatorId: "u1",
    projectId: "p3",
    tags: ["devops", "ci-cd"],
    deadline: "2026-02-15",
    createdAt: "2026-02-01T08:00:00",
    updatedAt: "2026-02-14T18:00:00",
    comments: [],
    subtasks: [
      { id: "s20", title: "Setup GitHub Actions", done: true },
      { id: "s21", title: "Configure test runner", done: true },
      { id: "s22", title: "Deploy to staging", done: true },
      { id: "s23", title: "Production deploy flow", done: true },
    ],
    timeEstimate: 6,
    timeSpent: 5,
  },
  {
    id: "t7",
    title: "Write E2E tests for checkout",
    description: "Create end-to-end tests covering the entire checkout flow using Playwright.",
    status: "new",
    priority: "medium",
    assigneeId: "u5",
    creatorId: "u1",
    projectId: "p2",
    tags: ["testing", "qa"],
    deadline: "2026-03-05",
    createdAt: "2026-02-16T10:00:00",
    updatedAt: "2026-02-16T10:00:00",
    comments: [],
    subtasks: [
      { id: "s24", title: "Setup Playwright config", done: false },
      { id: "s25", title: "Cart flow tests", done: false },
      { id: "s26", title: "Payment flow tests", done: false },
    ],
    timeEstimate: 14,
    timeSpent: 0,
  },
  {
    id: "t8",
    title: "Push notification system",
    description: "Implement push notifications for mobile app using Firebase Cloud Messaging.",
    status: "deferred",
    priority: "low",
    assigneeId: "u3",
    creatorId: "u6",
    projectId: "p2",
    tags: ["mobile", "backend"],
    deadline: "2026-03-15",
    createdAt: "2026-02-14T11:00:00",
    updatedAt: "2026-02-14T11:00:00",
    comments: [
      { id: "c5", userId: "u6", text: "Deferred to next sprint, focusing on auth first", createdAt: "2026-02-14T15:00:00" },
    ],
    subtasks: [],
    timeEstimate: 20,
    timeSpent: 0,
  },
  {
    id: "t9",
    title: "User profile settings page",
    description: "Build user profile settings page with avatar upload, personal info editing, and notification preferences.",
    status: "in_progress",
    priority: "medium",
    assigneeId: "u2",
    creatorId: "u6",
    projectId: "p1",
    tags: ["frontend", "ui"],
    deadline: "2026-02-27",
    createdAt: "2026-02-13T14:00:00",
    updatedAt: "2026-02-18T09:00:00",
    comments: [],
    subtasks: [
      { id: "s27", title: "Profile form layout", done: true },
      { id: "s28", title: "Avatar upload widget", done: false },
      { id: "s29", title: "Notification settings", done: false },
    ],
    timeEstimate: 12,
    timeSpent: 5,
  },
  {
    id: "t10",
    title: "API rate limiting middleware",
    description: "Implement rate limiting for the API endpoints to prevent abuse.",
    status: "review",
    priority: "high",
    assigneeId: "u3",
    creatorId: "u1",
    projectId: "p3",
    tags: ["backend", "security"],
    deadline: "2026-02-24",
    createdAt: "2026-02-11T09:00:00",
    updatedAt: "2026-02-17T12:00:00",
    comments: [
      { id: "c6", userId: "u1", text: "Please add tests for edge cases", createdAt: "2026-02-17T12:00:00" },
    ],
    subtasks: [
      { id: "s30", title: "Redis-based rate limiter", done: true },
      { id: "s31", title: "Per-endpoint configuration", done: true },
      { id: "s32", title: "Unit tests", done: true },
      { id: "s33", title: "Integration tests", done: false },
    ],
    timeEstimate: 8,
    timeSpent: 7,
  },
  {
    id: "t11",
    title: "Implement search functionality",
    description: "Build full-text search with filters for tasks, projects, and users. Use Elasticsearch.",
    status: "new",
    priority: "high",
    assigneeId: "u3",
    creatorId: "u6",
    projectId: "p4",
    tags: ["backend", "search"],
    deadline: "2026-03-10",
    createdAt: "2026-02-17T08:00:00",
    updatedAt: "2026-02-17T08:00:00",
    comments: [],
    subtasks: [
      { id: "s34", title: "Setup Elasticsearch", done: false },
      { id: "s35", title: "Index mapping", done: false },
      { id: "s36", title: "Search API endpoint", done: false },
      { id: "s37", title: "Frontend search UI", done: false },
    ],
    timeEstimate: 20,
    timeSpent: 0,
  },
  {
    id: "t12",
    title: "Mobile responsive nav menu",
    description: "Create a responsive hamburger navigation menu for the mobile version of the website.",
    status: "done",
    priority: "medium",
    assigneeId: "u2",
    creatorId: "u4",
    projectId: "p1",
    tags: ["frontend", "mobile"],
    deadline: "2026-02-18",
    createdAt: "2026-02-10T10:00:00",
    updatedAt: "2026-02-17T15:00:00",
    comments: [],
    subtasks: [
      { id: "s38", title: "Hamburger button component", done: true },
      { id: "s39", title: "Slide-out menu animation", done: true },
      { id: "s40", title: "Touch gesture support", done: true },
    ],
    timeEstimate: 6,
    timeSpent: 5,
  },
]

export const notifications: Notification[] = [
  { id: "n1", type: "task_assigned", title: "New task assigned", description: "You have been assigned to 'Implement authentication flow'", read: false, createdAt: "2026-02-19T09:30:00", taskId: "t2", userId: "u1" },
  { id: "n2", type: "comment_added", title: "New comment", description: "Alexey Petrov commented on 'API rate limiting middleware'", read: false, createdAt: "2026-02-19T08:15:00", taskId: "t10", userId: "u1" },
  { id: "n3", type: "deadline_approaching", title: "Deadline approaching", description: "'Implement authentication flow' is due in 3 days", read: false, createdAt: "2026-02-19T07:00:00", taskId: "t2" },
  { id: "n4", type: "status_changed", title: "Task status changed", description: "'Mobile responsive nav menu' was marked as Done", read: true, createdAt: "2026-02-18T16:30:00", taskId: "t12", userId: "u2" },
  { id: "n5", type: "mention", title: "You were mentioned", description: "Marina Ivanova mentioned you in 'Create component library docs'", read: true, createdAt: "2026-02-18T14:00:00", taskId: "t3", userId: "u2" },
  { id: "n6", type: "task_assigned", title: "New task assigned", description: "You have been assigned to 'Optimize database queries'", read: true, createdAt: "2026-02-18T10:00:00", taskId: "t4", userId: "u6" },
  { id: "n7", type: "comment_added", title: "New comment", description: "Natalia Smirnova commented on 'Redesign main page header'", read: true, createdAt: "2026-02-17T15:00:00", taskId: "t1", userId: "u6" },
  { id: "n8", type: "deadline_approaching", title: "Deadline approaching", description: "'API rate limiting middleware' is due in 5 days", read: true, createdAt: "2026-02-17T07:00:00", taskId: "t10" },
  { id: "n9", type: "status_changed", title: "Task completed", description: "'Setup CI/CD pipeline' was marked as Done", read: true, createdAt: "2026-02-16T18:00:00", taskId: "t6", userId: "u1" },
  { id: "n10", type: "mention", title: "You were mentioned", description: "Dmitry Sokolov mentioned you in a comment", read: true, createdAt: "2026-02-16T12:00:00", userId: "u3" },
]

export const defaultSettings: AppSettings = {
  profile: { name: "Alexey Petrov", email: "alexey@taskflow.io", avatar: "AP", role: "Team Lead" },
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
  appearance: { language: "en", theme: "dark" },
  workspace: { name: "TaskFlow Team", defaultProjectId: "p1" },
}

export const statusLabels: Record<Status, string> = {
  new: "New",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
  deferred: "Deferred",
}

export const priorityLabels: Record<Priority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
}

export const priorityColors: Record<Priority, string> = {
  urgent: "bg-destructive/15 text-destructive border-destructive/20",
  high: "bg-warning/15 text-warning border-warning/20",
  medium: "bg-info/15 text-info border-info/20",
  low: "bg-muted text-muted-foreground border-border",
}

export const priorityDotColors: Record<Priority, string> = {
  urgent: "bg-destructive",
  high: "bg-warning",
  medium: "bg-info",
  low: "bg-muted-foreground",
}

export function getUserById(id: string) {
  return users.find((u) => u.id === id)
}

export function getProjectById(id: string) {
  return projects.find((p) => p.id === id)
}
