import { apiClient } from "./client";
import { toPaginationQuery } from "./pagination";
import type {
  AdminOverview,
  AdminMoodboard,
  AdminFile,
  AdminInspiration,
  AdminNotification,
  AdminAuditLog,
  Lead,
  UpdateLeadDto,
  WaitlistEntry,
  UpdateUserRoleDto,
  AdminCreateUserDto,
  UpdateUserDto,
  User,
  DesignerApplication,
  ApproveDesignerApplicationDto,
  PaginatedResponse,
  PaginationParams,
} from "@repo/types";

export const adminApi = {
  getOverview: () =>
    apiClient.get<AdminOverview>("/admin/overview").then((r) => r.data),

  createUser: (dto: AdminCreateUserDto) =>
    apiClient.post<User>("/admin/users", dto).then((r) => r.data),

  updateUser: (id: string, dto: UpdateUserDto) =>
    apiClient.patch<User>(`/admin/users/${id}`, dto).then((r) => r.data),

  blockUser: (id: string) =>
    apiClient.patch<User>(`/admin/users/${id}/block`).then((r) => r.data),

  unblockUser: (id: string) =>
    apiClient.patch<User>(`/admin/users/${id}/unblock`).then((r) => r.data),

  getDesignerApplications: (params?: PaginationParams) =>
    apiClient
      .get<PaginatedResponse<DesignerApplication>>("/admin/designer-applications", {
        params: toPaginationQuery(params),
      })
      .then((r) => r.data),

  approveDesignerApplication: (id: string, dto: ApproveDesignerApplicationDto) =>
    apiClient
      .post<{ user: User; applicationId: string }>(`/admin/designer-applications/${id}/approve`, dto)
      .then((r) => r.data),

  rejectDesignerApplication: (id: string) =>
    apiClient
      .patch<DesignerApplication>(`/admin/designer-applications/${id}/reject`)
      .then((r) => r.data),

  deleteDesignerApplication: (id: string) =>
    apiClient.delete(`/admin/designer-applications/${id}`).then((r) => r.data),

  getLeads: (params?: PaginationParams) =>
    apiClient
      .get<PaginatedResponse<Lead>>("/admin/leads", { params: toPaginationQuery(params) })
      .then((r) => r.data),

  getWaitlist: (params?: PaginationParams) =>
    apiClient
      .get<PaginatedResponse<WaitlistEntry>>("/admin/waitlist", { params: toPaginationQuery(params) })
      .then((r) => r.data),

  getMoodboards: (params?: PaginationParams) =>
    apiClient
      .get<PaginatedResponse<AdminMoodboard>>("/admin/moodboards", { params: toPaginationQuery(params) })
      .then((r) => r.data),

  getFiles: (params?: PaginationParams) =>
    apiClient
      .get<PaginatedResponse<AdminFile>>("/admin/files", { params: toPaginationQuery(params) })
      .then((r) => r.data),

  getInspiration: (params?: PaginationParams) =>
    apiClient
      .get<PaginatedResponse<AdminInspiration>>("/admin/inspiration", { params: toPaginationQuery(params) })
      .then((r) => r.data),

  getNotifications: (params?: PaginationParams) =>
    apiClient
      .get<PaginatedResponse<AdminNotification>>("/admin/notifications", { params: toPaginationQuery(params) })
      .then((r) => r.data),

  getAuditLogs: (params?: PaginationParams) =>
    apiClient
      .get<PaginatedResponse<AdminAuditLog>>("/admin/audit-logs", { params: toPaginationQuery(params) })
      .then((r) => r.data),

  updateLead: (id: string, dto: UpdateLeadDto) =>
    apiClient.patch<Lead>(`/admin/leads/${id}`, dto).then((r) => r.data),

  deleteLead: (id: string) =>
    apiClient.delete(`/admin/leads/${id}`).then((r) => r.data),

  deleteWaitlistEntry: (id: string) =>
    apiClient.delete(`/admin/waitlist/${id}`).then((r) => r.data),

  deleteMoodboard: (id: string) =>
    apiClient.delete(`/admin/moodboards/${id}`).then((r) => r.data),

  deleteFile: (id: string) =>
    apiClient.delete(`/admin/files/${id}`).then((r) => r.data),

  deleteNotification: (id: string) =>
    apiClient.delete(`/admin/notifications/${id}`).then((r) => r.data),

  deleteProject: (id: string) =>
    apiClient.delete(`/admin/projects/${id}`).then((r) => r.data),

  deleteProposal: (id: string) =>
    apiClient.delete(`/admin/proposals/${id}`).then((r) => r.data),

  deleteMeeting: (id: string) =>
    apiClient.delete(`/admin/meetings/${id}`).then((r) => r.data),

  deleteTask: (id: string) =>
    apiClient.delete(`/admin/tasks/${id}`).then((r) => r.data),

  deleteInspiration: (id: string) =>
    apiClient.delete(`/admin/inspiration/${id}`).then((r) => r.data),

  updateUserRole: (id: string, dto: UpdateUserRoleDto) =>
    apiClient.patch<User>(`/admin/users/${id}/role`, dto).then((r) => r.data),

  deleteUser: (id: string) =>
    apiClient.delete(`/admin/users/${id}`).then((r) => r.data),
};
