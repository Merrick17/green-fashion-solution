import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { briefOptionsApi } from "@/lib/api/brief-options.api";
import { queryKeys } from "@/lib/query-keys";
import type {
  BriefOptionType,
  CreateBriefOptionDto,
  ListBriefOptionsParams,
  UpdateBriefOptionDto,
} from "@repo/types";

export function useBriefOptions(params?: ListBriefOptionsParams) {
  return useQuery({
    queryKey: queryKeys.briefOptions.list(params),
    queryFn: () => briefOptionsApi.list(params),
  });
}

export function useBriefSeasons() {
  return useBriefOptions({ type: "SEASON" as BriefOptionType });
}

export function useBriefCategories() {
  return useBriefOptions({ type: "CATEGORY" as BriefOptionType });
}

export function useAdminBriefOptions(params?: ListBriefOptionsParams) {
  return useQuery({
    queryKey: queryKeys.briefOptions.manage(params),
    queryFn: () => briefOptionsApi.listAll(params),
  });
}

export function useCreateBriefOption() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBriefOptionDto) => briefOptionsApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.briefOptions.all }),
  });
}

export function useUpdateBriefOption() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBriefOptionDto }) =>
      briefOptionsApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.briefOptions.all }),
  });
}

export function useDeleteBriefOption() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: briefOptionsApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.briefOptions.all }),
  });
}
