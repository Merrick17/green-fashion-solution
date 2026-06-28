import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api/projects.api";
import { queryKeys } from "@/lib/query-keys";
import type { CreateProjectDto, UpdateProjectDto, PaginationParams } from "@repo/types";

export function useProjects(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.projects.lists(params),
    queryFn: () => projectsApi.getAll(params),
    placeholderData: keepPreviousData,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => projectsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProjectDto) => projectsApi.create(dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.projects.all }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProjectDto }) =>
      projectsApi.update(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.all });
      qc.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
    },
  });
}
