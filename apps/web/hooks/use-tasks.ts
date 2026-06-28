import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { tasksApi } from "@/lib/api/tasks.api";
import { queryKeys } from "@/lib/query-keys";
import type { CreateTaskDto, UpdateTaskDto, TaskListParams } from "@repo/types";

export function useTasks(params?: TaskListParams) {
  return useQuery({
    queryKey: queryKeys.tasks.lists(params),
    queryFn: () => tasksApi.getAll(params),
    placeholderData: keepPreviousData,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => tasksApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTaskDto) => tasksApi.create(dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.tasks.all }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaskDto }) =>
      tasksApi.update(id, dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.tasks.all }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.tasks.all }),
  });
}
