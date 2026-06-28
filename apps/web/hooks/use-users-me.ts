import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/users.api";
import { queryKeys } from "@/lib/query-keys";

export function useMe() {
  return useQuery({
    queryKey: queryKeys.users.me,
    queryFn: usersApi.getMe,
  });
}

export function useUpdateEmailNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (emailNotifications: boolean) =>
      usersApi.updateEmailNotifications(emailNotifications),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.me }),
  });
}

export function useExportMyData() {
  return useMutation({
    mutationFn: usersApi.exportMe,
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gfs-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}

export function useDeleteMyAccount() {
  return useMutation({
    mutationFn: usersApi.deleteMe,
  });
}
