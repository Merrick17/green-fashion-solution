export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    lists: (params?: object) => [...queryKeys.projects.all, "list", params] as const,
    detail: (id: string) => [...queryKeys.projects.all, id] as const,
    agentContext: (id: string, revisionMode?: boolean) =>
      [...queryKeys.projects.all, id, "agent-context", revisionMode ?? false] as const,
  },
  proposals: {
    all: ["proposals"] as const,
    lists: (params?: object) => [...queryKeys.proposals.all, "list", params] as const,
    detail: (id: string) => [...queryKeys.proposals.all, id] as const,
  },
  assets: {
    fabrics: (params?: object) => ["assets", "fabrics", params] as const,
    fabricsAll: ["assets", "fabrics"] as const,
    products: (params?: object) => ["assets", "products", params] as const,
    productsAll: ["assets", "products"] as const,
  },
  tasks: {
    all: ["tasks"] as const,
    lists: (params?: object) => [...queryKeys.tasks.all, "list", params] as const,
    detail: (id: string) => [...queryKeys.tasks.all, id] as const,
  },
  meetings: {
    all: ["meetings"] as const,
    lists: (params?: object) => [...queryKeys.meetings.all, "list", params] as const,
    detail: (id: string) => [...queryKeys.meetings.all, id] as const,
  },
  leads: {
    all: ["leads"] as const,
  },
  files: {
    all: ["files"] as const,
    byProject: (projectId: string, params?: object) =>
      [...queryKeys.files.all, projectId, params] as const,
  },
  calendar: {
    all: ["calendar"] as const,
    range: (start: string, end: string) =>
      [...queryKeys.calendar.all, start, end] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    lists: (params?: object) => [...queryKeys.notifications.all, "list", params] as const,
  },
  moodboards: {
    all: ["moodboards"] as const,
    byProject: (projectId: string, params?: object) =>
      [...queryKeys.moodboards.all, projectId, params] as const,
    detail: (id: string) => [...queryKeys.moodboards.all, id] as const,
    full: (id: string) => [...queryKeys.moodboards.all, id, "full"] as const,
    snapshots: {
      byMoodboard: (moodboardId: string) =>
        [...queryKeys.moodboards.all, moodboardId, "snapshots"] as const,
      detail: (moodboardId: string, snapshotId: string) =>
        [...queryKeys.moodboards.all, moodboardId, "snapshots", snapshotId] as const,
    },
  },
  moodItems: {
    all: ["moodItems"] as const,
    byMoodboard: (moodboardId: string) =>
      [...queryKeys.moodItems.all, moodboardId] as const,
    detail: (moodboardId: string, id: string) =>
      [...queryKeys.moodItems.all, moodboardId, id] as const,
  },
  aiSessions: {
    all: ["aiSessions"] as const,
    byMoodboard: (moodboardId: string) =>
      [...queryKeys.aiSessions.all, moodboardId] as const,
  },
  proposalAiSessions: {
    all: ["proposalAiSessions"] as const,
    byProject: (projectId: string) =>
      [...queryKeys.proposalAiSessions.all, projectId] as const,
  },
  inspiration: {
    all: ["inspiration"] as const,
    byProject: (projectId: string, params?: object) =>
      [...queryKeys.inspiration.all, projectId, params] as const,
  },
  users: {
    all: ["users"] as const,
    me: ["users", "me"] as const,
    lists: (params?: object) => [...queryKeys.users.all, "list", params] as const,
  },
  milestones: {
    all: ["milestones"] as const,
    byProject: (projectId: string, params?: object) =>
      [...queryKeys.milestones.all, projectId, params] as const,
  },
  admin: {
    all: ["admin"] as const,
    overview: () => [...queryKeys.admin.all, "overview"] as const,
    leads: (params?: object) => [...queryKeys.admin.all, "leads", params] as const,
    waitlist: (params?: object) => [...queryKeys.admin.all, "waitlist", params] as const,
    moodboards: (params?: object) => [...queryKeys.admin.all, "moodboards", params] as const,
    files: (params?: object) => [...queryKeys.admin.all, "files", params] as const,
    inspiration: (params?: object) => [...queryKeys.admin.all, "inspiration", params] as const,
    notifications: (params?: object) => [...queryKeys.admin.all, "notifications", params] as const,
    auditLogs: (params?: object) => [...queryKeys.admin.all, "audit-logs", params] as const,
    designerApplications: (params?: object) =>
      [...queryKeys.admin.all, "designer-applications", params] as const,
  },
  collections: {
    all: ["collections"] as const,
    lists: (params?: object) => [...queryKeys.collections.all, "list", params] as const,
    detail: (id: string) => [...queryKeys.collections.all, id] as const,
  },
  messages: {
    all: ["messages"] as const,
    threads: (params?: object) => [...queryKeys.messages.all, "threads", params] as const,
    thread: (id: string) => [...queryKeys.messages.all, "thread", id] as const,
    briefQa: (projectId: string) => [...queryKeys.messages.all, "brief-qa", projectId] as const,
  },
  briefOptions: {
    all: ["briefOptions"] as const,
    list: (params?: object) => [...queryKeys.briefOptions.all, "list", params] as const,
    manage: (params?: object) => [...queryKeys.briefOptions.all, "manage", params] as const,
  },
} as const;