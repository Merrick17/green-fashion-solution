import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin.api";
import { queryKeys } from "@/lib/query-keys";
import type { UpdateUserRoleDto, AdminCreateUserDto, UpdateUserDto, ApproveDesignerApplicationDto, PaginationParams, UpdateLeadDto } from "@repo/types";

export function useAdminOverview() {
  return useQuery({
    queryKey: queryKeys.admin.overview(),
    queryFn: adminApi.getOverview,
  });
}

export function useAdminLeads(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.admin.leads(params),
    queryFn: () => adminApi.getLeads(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminWaitlist(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.admin.waitlist(params),
    queryFn: () => adminApi.getWaitlist(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminMoodboards(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.admin.moodboards(params),
    queryFn: () => adminApi.getMoodboards(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminFiles(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.admin.files(params),
    queryFn: () => adminApi.getFiles(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminInspiration(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.admin.inspiration(params),
    queryFn: () => adminApi.getInspiration(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminNotifications(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.admin.notifications(params),
    queryFn: () => adminApi.getNotifications(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminAuditLogs(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.admin.auditLogs(params),
    queryFn: () => adminApi.getAuditLogs(params),
    placeholderData: keepPreviousData,
  });
}

export function useDeleteAdminLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteLead,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admin.all }),
  });
}

export function useUpdateAdminLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateLeadDto }) =>
      adminApi.updateLead(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admin.leads() }),
  });
}

export function useDeleteAdminWaitlistEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteWaitlistEntry,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admin.all }),
  });
}

export function useDeleteAdminMoodboard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteMoodboard,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admin.all }),
  });
}

export function useDeleteAdminFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteFile,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admin.all }),
  });
}

export function useDeleteAdminNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteNotification,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admin.all }),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserRoleDto }) =>
      adminApi.updateUserRole(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
      qc.invalidateQueries({ queryKey: queryKeys.admin.overview() });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
      qc.invalidateQueries({ queryKey: queryKeys.admin.overview() });
    },
  });
}

export function useAdminDesignerApplications(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.admin.designerApplications(params),
    queryFn: () => adminApi.getDesignerApplications(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: AdminCreateUserDto) => adminApi.createUser(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
      qc.invalidateQueries({ queryKey: queryKeys.admin.overview() });
    },
  });
}

export function useBlockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.blockUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}

export function useUnblockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.unblockUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}

export function useApproveDesignerApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ApproveDesignerApplicationDto }) =>
      adminApi.approveDesignerApplication(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.all });
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useRejectDesignerApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.rejectDesignerApplication(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admin.all }),
  });
}

export function useDeleteDesignerApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteDesignerApplication,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admin.all }),
  });
}

export function useDeleteAdminProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects.all }),
  });
}

export function useDeleteAdminProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteProposal,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.proposals.all }),
  });
}

export function useDeleteAdminMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteMeeting,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.meetings.all }),
  });
}
