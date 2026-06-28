import type { AxiosInstance } from "axios";
import type {
  CreateTaskDto,
  PaginatedResponse,
  Task,
  TaskListParams,
  UpdateTaskDto,
} from "@repo/types";

export async function listTasks(
  client: AxiosInstance,
  params?: TaskListParams & { projectId?: string },
): Promise<PaginatedResponse<Task>> {
  const res = await client.get<PaginatedResponse<Task>>("/tasks", { params });
  return res.data;
}

export async function fetchTask(
  client: AxiosInstance,
  taskId: string,
): Promise<Task> {
  const res = await client.get<Task>(`/tasks/${taskId}`);
  return res.data;
}

export async function createTask(
  client: AxiosInstance,
  dto: CreateTaskDto,
): Promise<Task> {
  const res = await client.post<Task>("/tasks", dto);
  return res.data;
}

export async function updateTask(
  client: AxiosInstance,
  taskId: string,
  dto: UpdateTaskDto,
): Promise<Task> {
  const res = await client.patch<Task>(`/tasks/${taskId}`, dto);
  return res.data;
}
