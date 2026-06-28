import { apiClient } from "./client";
import { toPaginationQuery } from "./pagination";
import type {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskListParams,
  PaginatedResponse,
} from "@repo/types";

export const tasksApi = {
  getAll: (params?: TaskListParams) =>
    apiClient
      .get<PaginatedResponse<Task>>("/tasks", { params: toPaginationQuery(params) })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Task>(`/tasks/${id}`).then((r) => r.data),

  create: (dto: CreateTaskDto) =>
    apiClient.post<Task>("/tasks", dto).then((r) => r.data),

  update: (id: string, dto: UpdateTaskDto) =>
    apiClient.patch<Task>(`/tasks/${id}`, dto).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(`/tasks/${id}`).then((r) => r.data),
};
